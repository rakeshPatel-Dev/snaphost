import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const storageBucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'files'

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!serviceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

async function run() {
  // Collect expired sessions first, then their files via the explicit FK so the
  // relationship between the two queries is obvious and relies on indexes.
  const { data: sessions, error: sessionsErr } = await supabase
    .from('anon_sessions')
    .select('id')
    .lte('expires_at', new Date().toISOString())

  if (sessionsErr) {
    throw new Error(`Failed to fetch expired anon sessions: ${sessionsErr.message}`)
  }

  if (!sessions || sessions.length === 0) {
    console.log('No expired anon sessions found.')
    return
  }

  const sessionIds = sessions.map((s) => s.id)

  const { data: files, error: filesErr } = await supabase
    .from('files')
    .select('id, storage_path')
    .in('anon_session_id', sessionIds)

  if (filesErr) {
    throw new Error(`Failed to fetch files for expired sessions: ${filesErr.message}`)
  }

  const storagePaths = (files ?? []).map((f) => f.storage_path).filter(Boolean)

  if (storagePaths.length > 0) {
    console.log(`Deleting ${storagePaths.length} storage object(s)...`)
    // Supabase storage remove accepts array of paths
    const { error: storageErr } = await supabase.storage.from(storageBucket).remove(storagePaths)
    if (storageErr) {
      console.error('Storage deletion errors:', storageErr.message)
    } else {
      console.log('Storage deletion completed.')
    }
  }

  // Now call the DB-side purge function to remove sessions and cascade files
  const { data: purgeRes, error: purgeErr } = await supabase.rpc('purge_expired_anon_sessions')

  if (purgeErr) {
    throw new Error(`Failed to purge expired sessions: ${purgeErr.message}`)
  }

  console.log('Purge complete, rows affected:', purgeRes)
}

run().catch((err) => {
  console.error('Purge worker failed:', err.message || err)
  process.exitCode = 1
})

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
  const { data: expiredFiles, error: queryError } = await supabase
    .from('files')
    .select('id, storage_path, expires_at')
    .not('expires_at', 'is', null)
    .lt('expires_at', new Date().toISOString())
    .is('deleted_at', null)

  if (queryError) {
    throw new Error(`Failed to fetch expired files: ${queryError.message}`)
  }

  if (!expiredFiles || expiredFiles.length === 0) {
    console.log('No expired files found.')
    return
  }

  console.log(`Found ${expiredFiles.length} expired file(s).`)

  let deletedCount = 0

  for (const file of expiredFiles) {
    const { error: storageError } = await supabase.storage
      .from(storageBucket)
      .remove([file.storage_path])

    if (storageError) {
      console.error(
        `Storage delete failed for ${file.id} (${file.storage_path}):`,
        storageError.message
      )
      continue
    }

    const { error: dbError } = await supabase.from('files').delete().eq('id', file.id)

    if (dbError) {
      console.error(`DB delete failed for ${file.id}:`, dbError.message)
      continue
    }

    deletedCount += 1
    console.log(`Deleted expired file ${file.id}`)
  }

  console.log(`Cleanup complete. Deleted ${deletedCount} file(s).`)
}

run().catch((error) => {
  console.error('Cleanup worker failed:', error.message)
  process.exitCode = 1
})

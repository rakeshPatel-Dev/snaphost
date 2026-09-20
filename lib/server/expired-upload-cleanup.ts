import 'server-only';

import { CONFIG } from '@/lib/config';
import { supabaseAdmin } from '@/lib/server/supabase-admin';

const BATCH_SIZE = 100;

type CleanupTotals = {
  scanned: number;
  deleted: number;
  failures: number;
};

type ExpiredFile = {
  id: string;
  storage_path: string;
};

type ExpiredAnonymousSession = {
  id: string;
  files: ExpiredFile[] | null;
};

async function removeStoragePaths(paths: string[]) {
  if (paths.length === 0) {
    return true;
  }

  for (let offset = 0; offset < paths.length; offset += BATCH_SIZE) {
    const batch = paths.slice(offset, offset + BATCH_SIZE);
    const { error } = await supabaseAdmin.storage.from(CONFIG.STORAGE_BUCKET).remove(batch);

    if (error) {
      console.error('Failed to remove expired storage objects', error);
      return false;
    }
  }

  return true;
}

async function purgeExpiredAnonymousSessions(): Promise<CleanupTotals> {
  const totals: CleanupTotals = { scanned: 0, deleted: 0, failures: 0 };
  const now = new Date().toISOString();

  while (true) {
    const { data, error } = await supabaseAdmin
      .from('anon_sessions')
      .select('id, files(id, storage_path)')
      .lte('expires_at', now)
      .limit(BATCH_SIZE);

    if (error) {
      throw new Error(`Failed to load expired anonymous sessions: ${error.message}`);
    }

    const sessions = (data ?? []) as ExpiredAnonymousSession[];
    if (sessions.length === 0) {
      break;
    }

    for (const session of sessions) {
      totals.scanned += 1;
      const paths = (session.files ?? []).map((file) => file.storage_path).filter(Boolean);

      // Keep the session and its rows if its blobs cannot be removed. A future
      // run can retry safely; deleting the rows first would orphan the blobs.
      if (!(await removeStoragePaths(paths))) {
        totals.failures += 1;
        continue;
      }

      const { error: deleteError } = await supabaseAdmin
        .from('anon_sessions')
        .delete()
        .eq('id', session.id);

      if (deleteError) {
        console.error(`Failed to remove expired anonymous session ${session.id}`, deleteError);
        totals.failures += 1;
        continue;
      }

      totals.deleted += 1;
    }

    if (totals.failures > 0 || sessions.length < BATCH_SIZE) {
      break;
    }
  }

  return totals;
}

async function purgeExpiredFiles(): Promise<CleanupTotals> {
  const totals: CleanupTotals = { scanned: 0, deleted: 0, failures: 0 };
  const now = new Date().toISOString();

  while (true) {
    const { data, error } = await supabaseAdmin
      .from('files')
      .select('id, storage_path')
      .not('expires_at', 'is', null)
      .lt('expires_at', now)
      .is('deleted_at', null)
      .limit(BATCH_SIZE);

    if (error) {
      throw new Error(`Failed to load expired files: ${error.message}`);
    }

    const files = (data ?? []) as ExpiredFile[];
    if (files.length === 0) {
      break;
    }

    for (const file of files) {
      totals.scanned += 1;

      if (!(await removeStoragePaths([file.storage_path]))) {
        totals.failures += 1;
        continue;
      }

      const { error: deleteError } = await supabaseAdmin
        .from('files')
        .delete()
        .eq('id', file.id)
        .is('deleted_at', null);

      if (deleteError) {
        console.error(`Failed to remove expired file row ${file.id}`, deleteError);
        totals.failures += 1;
        continue;
      }

      totals.deleted += 1;
    }

    // A batch with failures remains eligible for the next scheduled run. Stop
    // now to avoid retrying a persistent storage failure in a tight loop.
    if (totals.failures > 0 || files.length < BATCH_SIZE) {
      break;
    }
  }

  return totals;
}

export async function cleanUpExpiredUploads() {
  const sessions = await purgeExpiredAnonymousSessions();
  const files = await purgeExpiredFiles();
  const failures = sessions.failures + files.failures;

  return {
    sessions,
    files,
    failures,
  };
}

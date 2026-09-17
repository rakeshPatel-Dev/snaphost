-- ============================================
-- EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_tier_enum AS ENUM (
  'free',
  'premium'
);

CREATE TYPE file_type_enum AS ENUM (
  'image',
  'pdf'
);

CREATE TYPE upload_type_enum AS ENUM (
  'anonymous',
  'custom'
);

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- public username used in links: /u/:username/:slug
  username TEXT UNIQUE,

  email TEXT UNIQUE NOT NULL,

  tier user_tier_enum DEFAULT 'free',

  created_at TIMESTAMP DEFAULT NOW(),

  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ANON SESSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS anon_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- random token stored only as its sha256 hash
  token_hash TEXT UNIQUE NOT NULL,

  -- session lifetime (24h, matching anon file expiry)
  expires_at TIMESTAMP NOT NULL,

  revoked_at TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- FILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- owner (nullable for anonymous uploads)
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- anonymous session owner (nullable for signed-in uploads)
  anon_session_id UUID REFERENCES anon_sessions(id) ON DELETE CASCADE,

  -- upload type: anonymous (anon 24h) or custom (user-controlled)
  upload_type upload_type_enum NOT NULL DEFAULT 'anonymous',

  -- public URL slug
  slug TEXT NOT NULL,

  -- original uploaded filename
  filename TEXT NOT NULL,

  -- image or pdf
  file_type file_type_enum NOT NULL,

  -- actual mime type
  mime_type TEXT NOT NULL,

  -- file size in bytes
  size BIGINT NOT NULL,

  -- storage path in bucket
  storage_path TEXT NOT NULL,

  -- null = permanent
  expires_at TIMESTAMP NULL,

  -- soft delete
  deleted_at TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT NOW(),

  updated_at TIMESTAMP DEFAULT NOW()
);

-- Migration guard for existing databases that still have user_id marked NOT NULL
ALTER TABLE files
  ALTER COLUMN user_id DROP NOT NULL;

-- Enforce upload-type / ownership consistency:
-- anonymous uploads must have user_id IS NULL, custom uploads must have user_id NOT NULL
ALTER TABLE files
  ADD CONSTRAINT files_upload_type_user_consistency CHECK (
    (upload_type = 'anonymous' AND user_id IS NULL)
    OR
    (upload_type = 'custom' AND user_id IS NOT NULL)
  );

-- For anonymous uploads, enforce expires_at present and <= 24 hours from creation
ALTER TABLE files
  ADD CONSTRAINT files_anonymous_expires_check CHECK (
    upload_type <> 'anonymous'
    OR (
      expires_at IS NOT NULL
      AND expires_at <= (NOW() + INTERVAL '24 hours')
    )
  );

-- Migration guard for existing databases that are missing the column
ALTER TABLE files
  ADD COLUMN IF NOT EXISTS anon_session_id UUID REFERENCES anon_sessions(id) ON DELETE CASCADE;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_files_user_id
ON files(user_id);

CREATE INDEX IF NOT EXISTS idx_files_anon_session_id
ON files(anon_session_id);

CREATE INDEX IF NOT EXISTS idx_files_slug
ON files(slug);

-- Anonymous slugs must be globally unique (when user_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_files_slug_anonymous
  ON files(slug)
  WHERE user_id IS NULL;

-- Logged-in users may reuse same slug across different users; enforce uniqueness per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_files_user_slug
  ON files(user_id, slug)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_files_expires_at
ON files(expires_at);

CREATE INDEX IF NOT EXISTS idx_files_deleted_at
ON files(deleted_at);

CREATE INDEX IF NOT EXISTS idx_files_created_at
ON files(created_at DESC);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
  SELECT id
  FROM users
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at
BEFORE UPDATE ON files
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ANON SESSION LINK LIMIT TRIGGER
-- ============================================

-- Caps each anonymous session at 3 active links. The raised message must stay
-- in sync with the check in app/api/upload/route.ts.
CREATE OR REPLACE FUNCTION enforce_anon_session_link_limit()
RETURNS TRIGGER AS $$
DECLARE
  active_links INTEGER;
BEGIN
  IF NEW.anon_session_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*)
    INTO active_links
    FROM files
   WHERE anon_session_id = NEW.anon_session_id
     AND deleted_at IS NULL
     AND (expires_at IS NULL OR expires_at > NOW());

  IF active_links >= 3 THEN
    RAISE EXCEPTION 'anon session link limit reached';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_anon_session_link_limit ON files;
CREATE TRIGGER enforce_anon_session_link_limit
BEFORE INSERT ON files
FOR EACH ROW
EXECUTE FUNCTION enforce_anon_session_link_limit();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE anon_sessions ENABLE ROW LEVEL SECURITY;

-- ============ USERS TABLE POLICIES ============

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth_user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- System/backend can insert users
CREATE POLICY "System can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- ============ FILES TABLE POLICIES ============

-- 1. PUBLIC READ: Anyone can read active, non-expired, non-deleted files
CREATE POLICY "Public read active files"
  ON files FOR SELECT
  USING (
    deleted_at IS NULL
    AND (
      expires_at IS NULL
      OR expires_at > NOW()
    )
  );

-- 2. ANONYMOUS UPLOAD: Public users can upload files (no auth required)
CREATE POLICY "Allow anonymous uploads"
  ON files FOR INSERT
  WITH CHECK (
    upload_type = 'anonymous'
    AND user_id IS NULL
    AND deleted_at IS NULL
    AND expires_at IS NOT NULL
    AND expires_at <= (NOW() + INTERVAL '24 hours')
  );

-- 3. AUTHENTICATED READ: Users can read their own files + public files
CREATE POLICY "Authenticated users read own and public files"
  ON files FOR SELECT
  USING (
    (
      deleted_at IS NULL
      AND (
        expires_at IS NULL
        OR expires_at > NOW()
      )
    )
    OR
    (user_id = current_user_id())
  );

-- 4. AUTHENTICATED UPLOAD: Logged-in users can upload files
CREATE POLICY "Authenticated users can upload"
  ON files FOR INSERT
  WITH CHECK (
    upload_type = 'custom'
    AND user_id = current_user_id()
    AND deleted_at IS NULL
  );

-- 5. AUTHENTICATED UPDATE: Users can only update/manage their own files
CREATE POLICY "Users can update own files"
  ON files FOR UPDATE
  USING (user_id = current_user_id())
  WITH CHECK (user_id = current_user_id());

-- 6. AUTHENTICATED DELETE: Users can soft-delete their own files
CREATE POLICY "Users can delete own files"
  ON files FOR DELETE
  USING (user_id = current_user_id());

-- 7. SERVICE ROLE: Backend service role can manage all files (for cleanup)
CREATE POLICY "Service role manages all files"
  ON files FOR ALL
  USING (true)
  WITH CHECK (true);

-- This function emits a NOTIFY for each expired file (so a backend worker
-- can remove the object from storage) and then deletes the DB row.
CREATE OR REPLACE FUNCTION delete_expired_files()
RETURNS INTEGER AS $$
DECLARE
  r RECORD;
  deleted_count INTEGER := 0;
BEGIN
  FOR r IN SELECT id, storage_path FROM files
           WHERE expires_at IS NOT NULL
             AND expires_at < NOW()
             AND deleted_at IS NULL
  LOOP
    -- Notify backend to delete storage object. Payload is JSON with id and storage_path
    PERFORM pg_notify('snaphost_expired_file', json_build_object('id', r.id, 'storage_path', r.storage_path)::text);
  END LOOP;

  DELETE FROM files
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW()
    AND deleted_at IS NULL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Deletes expired anonymous sessions. File rows are removed via ON DELETE CASCADE;
-- storage objects are cleaned up by the worker script before calling this via rpc().
CREATE OR REPLACE FUNCTION purge_expired_anon_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  DELETE FROM anon_sessions
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

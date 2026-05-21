-- Create files table for SnapHost
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id TEXT UNIQUE NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf' or 'image'
  size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  mime_type TEXT
);

-- Create index for fast lookups by file_id
CREATE INDEX IF NOT EXISTS idx_file_id ON files(file_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON files(created_at DESC);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all files
CREATE POLICY "Allow public read access"
  ON files FOR SELECT
  USING (true);

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts"
  ON files FOR INSERT
  WITH CHECK (true);

"use client";

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type FileItem = {
  id: string;
  filename: string;
  slug: string;
  created_at: string;
  expires_at: string | null;
  publicUrl?: string;
};

export default function AnonLinks() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/anon/files', { credentials: 'same-origin' });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data?.error || 'Failed to load links');
          return;
        }

        if (mounted) setFiles(data.files ?? []);
      } catch (err) {
        console.error('anon links load', err);
        toast.error('Failed to load links');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this anonymous link? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/anon/files/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || 'Failed to delete');
        return;
      }

      setFiles((s) => s.filter((f) => f.id !== id));
      toast.success('Deleted');
    } catch (err) {
      console.error('delete anon', err);
      toast.error('Delete failed');
    } finally {
      setDeleting(null);
    }
  }

  if (loading) return <div>Loading...</div>;

  if (files.length === 0) {
    return <div className="text-sm text-muted-foreground">No anonymous links found for this session.</div>;
  }

  return (
    <div className="space-y-3">
      {files.map((f) => (
        <div key={f.id} className="flex items-center justify-between rounded-md border p-3">
          <div>
            <div className="text-sm font-medium">{f.filename}</div>
            <a href={f.publicUrl} className="text-xs text-muted-foreground underline">Open link</a>
            <div className="text-xs text-muted-foreground">Expires: {f.expires_at ?? 'never'}</div>
          </div>
          <div>
            <button
              className="inline-flex items-center rounded bg-red-600 px-3 py-1 text-xs text-white"
              onClick={() => handleDelete(f.id)}
              disabled={deleting === f.id}
            >
              {deleting === f.id ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

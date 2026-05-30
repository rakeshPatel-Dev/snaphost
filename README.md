# SnapHost — Instant File Sharing Platform (MVP)

**Fastest way to turn a file into a shareable link.**

SnapHost is an instant file hosting and sharing platform for images and PDFs with clean public links. Upload a file, get a shareable link in seconds, and share with anyone.

---

## 🎯 What is SnapHost?

SnapHost solves the problem of quickly sharing files online without friction:
- ✅ Upload images or PDFs
- ✅ Get instant clean shareable links
- ✅ Preview files online
- ✅ Download or reshare anytime
- ✅ Zero login required (anonymous uploads)

**Goal**: Upload → Link in < 5 seconds

---

## 📋 MVP Features

### ✨ Core Features
- **File Upload**: PNG, JPG, JPEG, WEBP, PDF
- **Instant Link Generation**: Format: `snaphost.cloud/f/{fileId}`
- **File Preview**: Images render inline, PDFs embedded viewer
- **Download**: Direct download button
- **Copy Link**: One-click link sharing
- **Drag & Drop**: Easy file upload experience
- **Public Access**: No login required

### 📊 Supported File Types
| Type | Max Size | Format |
|------|----------|--------|
| Images | 10 MB | PNG, JPG, JPEG, WEBP |
| PDF | 10 MB | PDF |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Supabase account (free tier works)

### Setup

1. **Clone & Install**
   ```bash
   git clone <repo>
   cd snaphost
   pnpm install
   ```

2. **Environment Variables**
   
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  NEXT_PUBLIC_SUPABASE_AUTH_PROVIDERS=google,github
   ```

3. **Setup Supabase**
   
   In **Supabase Dashboard → SQL Editor**, run:
   ```sql
   CREATE TABLE files (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     file_id TEXT UNIQUE NOT NULL,
     filename TEXT NOT NULL,
     file_type TEXT NOT NULL, -- 'pdf' or 'image'
     size BIGINT NOT NULL,
     storage_path TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     mime_type TEXT
   );

   CREATE INDEX idx_file_id ON files(file_id);
   ```

   **Setup Storage Bucket**:
   - Go to **Storage → Create new bucket**
   - Name: `files`
   - Make it public
   - Add policies in **Storage → Policies**:
     ```sql
     -- Allow public read
     CREATE POLICY "Allow public read"
       ON storage.objects FOR SELECT
       USING (bucket_id = 'files');

     -- Allow public write
     CREATE POLICY "Allow public write"
       ON storage.objects FOR INSERT
       WITH CHECK (bucket_id = 'files');
     ```

4. **Run Dev Server**
   ```bash
   pnpm dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
snaphost/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Root layout
│   ├── api/
│   │   ├── upload/route.ts        # POST /api/upload
│   │   └── files/[fileId]/route.ts # GET /api/files/[fileId]
│   └── f/[fileId]/
│       └── page.tsx               # File preview page
├── components/
│   ├── UploadBox.tsx              # Upload component with drag-drop
│   ├── FilePreview.tsx            # File preview handler
│   ├── ImagePreview.tsx           # Image renderer
│   ├── PdfPreview.tsx             # PDF viewer
│   ├── UploadSuccess.tsx          # Success modal/screen
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── fileValidation.ts          # File type & size validation
│   ├── generateFileId.ts          # Unique ID generation
│   ├── sanitizeFilename.ts        # Filename sanitization
│   ├── config.ts                  # Configuration constants
│   ├── database.ts                # Database queries
│   ├── storage.ts                 # Supabase storage helpers
│   └── supabase.ts                # Supabase client
├── styles/
│   └── globals.css                # Global styles
└── public/                        # Static assets
```

---

## 🔌 API Endpoints

### POST /api/upload
Upload a file and get a shareable link.

**Request**:
```
Content-Type: multipart/form-data
Body: FormData with 'file' field
```

**Response**:
```json
{
  "fileId": "abc12345",
  "url": "https://snaphost.cloud/f/abc12345"
}
```

**Errors**:
- `400`: Invalid file type or too large
- `500`: Storage error

---

### GET /api/files/[fileId]
Fetch file metadata.

**Response**:
```json
{
  "id": "uuid",
  "fileId": "abc12345",
  "filename": "document.pdf",
  "fileType": "pdf",
  "size": 2048576,
  "createdAt": "2026-05-21T10:00:00Z",
  "url": "https://storage-url/..."
}
```

**Errors**:
- `404`: File not found
- `500`: Server error

---

## 🎨 User Flow

### Upload Flow
```
1. User visits homepage
2. Drags file or clicks to upload
3. File validates (type, size)
4. Uploads to Supabase Storage
5. System generates unique ID
6. Metadata saved to database
7. Returns clean link
8. Show success screen with copy button
```

### Viewing Flow
```
1. User opens shared link
2. System fetches metadata
3. Preview page loads
4. Image or PDF renders
5. User can download or reshare
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage (object storage)
- **PDF Viewer**: react-pdf
- **Auth**: Supabase Auth (email/password + OAuth providers)
- **Icons**: Lucide React
- **Notifications**: Sonner (toast)

---

## 📦 Installation & Dependencies

**Core Dependencies**:
```json
{
  "next": "^16.0.0",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "@supabase/supabase-js": "latest",
  "nanoid": "^3.3.12",
  "react-pdf": "latest",
  "tailwindcss": "^4.3.0",
  "sonner": "latest"
}
```

Install dependencies:
```bash
pnpm install
```

---

## 🎯 Performance Targets (MVP)

| Metric | Target |
|--------|--------|
| Upload Response | <3 seconds (excluding file transfer) |
| Page Load | <1.5 seconds |
| Supported Load | 1k–10k uploads/day |
| Uptime Target | 99%+ (relaxed for MVP) |

---

## 🔒 Security Features

- ✅ File type validation (MIME type + extension check)
- ✅ File size limits enforced server-side
- ✅ Filename sanitization (prevent path traversal)
- ✅ Prevent executable/script uploads
- ✅ Unique, non-guessable file IDs (8 chars, ~2 trillion combinations)
- ✅ Public storage with RLS policies
- ✅ CORS configured for secure cross-origin access

---

## 📋 MVP Checklist

- [x] Database schema created
- [x] Storage bucket configured
- [x] API upload endpoint working
- [x] API file metadata endpoint working
- [x] Homepage built
- [x] Upload component with drag-drop
- [x] File preview page
- [x] Image preview rendering
- [x] PDF viewer integration
- [x] Download functionality
- [x] Copy link functionality
- [x] Error handling & validation
- [ ] Mobile responsive testing
- [ ] Performance optimization
- [ ] Production deployment

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

```bash
# Preview
vercel

# Production
vercel --prod
```

### Manual Deployment
```bash
pnpm run build
pnpm start
```

---

## 🗓️ Post-MVP Roadmap

### Phase 2 (User Accounts)
- User accounts with Supabase Auth
- Dashboard to manage uploads
- Delete file functionality
- File expiration dates

### Phase 3 (Advanced Features)
- Custom domains
- Analytics dashboard
- Password-protected links
- API access for developers

### Phase 4 (Integrations)
- CLI upload tool
- Browser extension
- Mobile app

---

## 🐛 Troubleshooting

### "Next.js package not found"
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

### Upload fails with 403 error
- Check Supabase storage RLS policies
- Ensure bucket is named `files`
- Verify policies allow public INSERT

### Files not appearing in preview
- Check database `files` table has records
- Verify storage bucket has uploaded files
- Check browser console for errors

### Build errors
```bash
pnpm exec tsc --noEmit  # Check TS errors
pnpm run lint           # Check linting
```

---

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server only) |
| `NEXT_PUBLIC_SUPABASE_AUTH_PROVIDERS` | No | OAuth providers to show on auth screen (e.g. `google,github`) |
| `NEXT_PUBLIC_BASE_URL` | No | Custom domain (default: localhost:3000, production: https://sh.rakeshpatel.me) |

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [react-pdf](https://react-pdf.org)

---

## 👨‍💻 Contributing

This is an MVP. Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit PRs for improvements

---

## 📄 License

MIT License — See LICENSE file for details

---

## 💡 Key Insights

> **"SnapHost only wins if uploads are instant, links feel clean, and UI feels frictionless. If it becomes complex, it dies."**

This is a lightweight sharing tool, not storage infrastructure. Keep it simple.

---

Made with ❤️ by the SnapHost team

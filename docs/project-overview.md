# SnapHost — Project Overview

**SnapHost** is a file sharing platform that lets you upload an image or PDF and get a shareable link in seconds. No sign-up, no hassle. Think of it like Imgur, but for any file type.

---

## What Does It Do?

SnapHost solves a simple problem: you need to share a file with someone quickly, but you don't want to go through the friction of signing into Google Drive, Dropbox, or WeTransfer.

**The flow is dead simple:**

1. Go to snaphost.cloud
2. Drag a file onto the page (or click to select one)
3. Instantly get a short link to share with anyone
4. Done. That's it.

The person receiving the link can view the file in their browser and download it — no account required.

---

## Who Is It For?

- **Casual users** — sharing screenshots, photos, or documents with friends
- **Designers & developers** — sharing work-in-progress with colleagues
- **Anyone** who needs to send a file once and doesn't want to deal with cloud storage setup

---

## Key Features (What You Can Do)

| Feature | How It Works |
|---------|-------------|
| **Instant upload** | Drag a file onto the page — link is ready in seconds |
| **Supported files** | Images (PNG, JPG, WEBP) and PDFs, up to 10 MB each |
| **Shareable links** | Each file gets a unique, short link like `snaphost.cloud/f/abc12345` |
| **File preview** | Images show inline, PDFs open in a built-in viewer |
| **Download** | Recipients can download the original file |
| **No account needed** | Anyone can upload and share without signing up |
| **Anonymous uploads** | Upload without creating an account; links expire in 24 hours |
| **User accounts** | Create a free account (email, Google, or GitHub) for a personal dashboard |
| **Personal dashboard** | See all your uploads, rename files, set expiration dates, delete files |
| **Custom URLs** | Signed-in users can customize their share link (e.g. `snaphost.cloud/yourname/my-image`) |

---

## How Is It Built?

The application is a modern web app split into a frontend (what you see) and a backend (the engine behind it).

- **Frontend** — Built with Next.js and React. This is the interface you interact with in your browser.
- **Backend** — Runs on the same server, handling uploads, storage, and link generation.
- **Storage** — Files are stored securely in the cloud using Supabase (a PostgreSQL database + file storage service).
- **Authentication** — Supports email/password login as well as Google and GitHub sign-in for users who want accounts.

---

## Current Status

SnapHost is live and functional as an MVP (Minimum Viable Product). The core upload + share flow works. User accounts and dashboards are built. We are actively adding more features.

---

## What's Coming Next

- **Password-protected links** — Lock your shared files with a password
- **View/download analytics** — See how many times your file was viewed
- **Custom domains** — Use your own website name for links
- **API & CLI tool** — Upload files programmatically (for developers)
- **Browser extension** — Share files directly from your browser
- **Mobile app** — Upload and share from your phone

---

## Questions?

Contact the SnapHost team at **hello@snaphost.cloud**

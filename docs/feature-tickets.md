# Feature Tickets

This document tracks planned features, improvements, and bug fixes for SnapHost. Each ticket follows a standard format with priority labels and status tracking.

---

## Priority Levels

| Label | Meaning |
|-------|---------|
| 🔴 P0 | Must-have — blocks launch or core functionality |
| 🟡 P1 | Important — high value, should ship soon |
| 🟢 P2 | Nice-to-have — quality of life or polish |
| ⚪ P3 | Future — no immediate plan |

## Status Definitions

- **Backlog** — Idea is noted, not yet planned
- **Planned** — Assigned to a milestone, ready to build
- **In Progress** — Currently being worked on
- **Done** — Shipped
- **Cancelled** — No longer pursuing

---

## Active Tickets

### P1 — Password-Protected Links
**Status:** Planned | **Milestone:** v1.1
- Allow users to set a password when uploading
- Recipient must enter the password to view the file
- Encrypt access check server-side

---

### P1 — View/Download Analytics
**Status:** Backlog | **Milestone:** v1.1
- Track how many times each file is viewed and downloaded
- Show basic analytics on the dashboard for signed-in users
- Store view events (no personal data)

---

### P2 — File Expiry for Anonymous Uploads
**Status:** Done | **Milestone:** v1.0
- Anonymous uploads auto-expire after 24 hours
- Background cleanup script removes expired files from storage + database

---

### P2 — Anonymous Upload Management Page
**Status:** Done | **Milestone:** v1.0
- Dedicated page where anonymous users can see their recent uploads
- Uses session-based tracking (no login required)

---

### P2 — Custom Domains
**Status:** Backlog | **Milestone:** v2.0
- Allow Pro users to use their own domain for share links
- DNS configuration guide and CNAME setup

---

### P1 — Email Upload Notifications
**Status:** Backlog | **Milestone:** v1.2
- Optional email notification when someone views your shared file
- Toggle on/off per file

---

## Ticket Template

Use this template when creating new feature tickets:

```markdown
### [Title — Short, Actionable Name]
**Priority:** [P0/P1/P2/P3]
**Status:** [Backlog / Planned / In Progress / Done / Cancelled]
**Milestone:** [Milestone name or version]

**Description**
[2-3 sentences explaining what this feature does and why it matters]

**User Story**
As a [type of user], I want to [action] so that [benefit].

**Acceptance Criteria**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Technical Notes**
[optional — any implementation considerations, dependencies, or architecture notes]

**Design Reference**
[optional — link to Figma, mockup, or screenshot]
```

---

## Completed Tickets

### P0 — Anonymous File Upload
**Status:** Done | **Milestone:** v1.0
- Upload images (PNG, JPG, WEBP) and PDFs up to 10 MB
- Drag-and-drop interface
- File type and size validation (client + server)
- Generate unique 8-character file IDs

### P0 — Shareable Link Generation
**Status:** Done | **Milestone:** v1.0
- Format: `snaphost.dev/f/{fileId}`
- One-click copy to clipboard
- Publicly accessible preview page

### P0 — File Preview Page
**Status:** Done | **Milestone:** v1.0
- Images render inline
- PDFs display in embedded viewer
- Download button
- Copy link button

### P1 — User Accounts (Auth)
**Status:** Done | **Milestone:** v1.0
- Email/password sign-up and login
- Google and GitHub OAuth
- Forgot password / reset password flow

### P1 — User Dashboard
**Status:** Done | **Milestone:** v1.0
- View all uploaded files in one place
- Rename files
- Delete files
- Set custom expiration dates

### P1 — Custom URL Slugs
**Status:** Done | **Milestone:** v1.0
- Signed-in users can customize their share link: `snaphost.dev/{username}/{slug}`
- Unique per user, editable from dashboard

---

## Ticket Ideas (Not Yet Scoped)

- Batch upload (multiple files at once)
- Folder organization in dashboard
- Drag-to-reorder files in dashboard
- QR code generation for share links
- Dark mode toggle
- File comments / feedback from recipients
- Upload progress bar (for large files)
- Video file support
- Archive (ZIP) support
- Team / workspace sharing
- API keys for developer access
- CLI upload tool
- Browser extension (Chrome, Firefox)
- Mobile app (iOS, Android)
- Slack / Discord integration
- Webhook notifications on file access

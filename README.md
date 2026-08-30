# My Portfolio — Setup Guide

This README explains how to run the portfolio locally and how to configure Supabase (database, storage, and policies).

Prerequisites
- Node.js (LTS) — https://nodejs.org/
- PowerShell (Windows)

Quick start (Windows PowerShell)
1. Open PowerShell in: `C:\my-portfolio`
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Create a local .env from the example and edit it:
   ```powershell
   Copy-Item .env.example .env
   notepad .env
   ```
   Add your Supabase values:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_CONTACT_EMAIL=your-email@example.com
   ```

Run the app
```powershell
npm run dev
# Visit http://localhost:5173
```

Supabase setup (summary)
1. Create a project at https://supabase.com
2. In Project → Settings → API copy:
   - Project URL
   - Anon public key
3. Add the values to the local `.env` file using the variable names documented above.

The current frontend uses Supabase only to read public portfolio content:

- `projects` — project title, description, image URLs, links, features, and technology data
- `certificates` — certificate image URLs

The exact production schema is managed in Supabase and is not recreated by this repository. Keep anonymous access limited to the public fields required by the portfolio. The frontend must not use anonymous `INSERT`, `UPDATE`, or `DELETE` policies for portfolio data.

Visitor comments, visitor email storage, and visitor profile-photo uploads are not part of the current application. The frontend does not access a comments table or upload visitor files to Supabase Storage. Do not create anonymous write policies for those retired features.

Project image URLs may point to intentionally public assets managed in the existing production setup. Existing Supabase tables, buckets, objects, and policies are not deleted or changed by this repository cleanup.

Adding projects (via Supabase UI)
- Go to Supabase → Table Editor → public.projects → Insert row
- For JSON fields use valid JSON arrays, e.g. Features: ["Feature 1", "Feature 2"]

Notes & license
- Do not copy or redistribute this project without proper credit to the author.
- For questions or collaboration reach out on GitHub.

Contact
- Project author: Kyaw Shein
- Website: https://my-portfolio-mu-tan-89.vercel.app/
- GitHub: KyawShein404







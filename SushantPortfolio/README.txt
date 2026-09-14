SUSHANT YADAV — Vercel-ready deployment

This package is adapted for Vercel from the original Node/SQLite project.
- Public website files live in /public.
- Profile photo is /public/assets/sushant-yadav.png.
- API entry is /api/[...path].js.
- Vercel runtime uses /tmp only for ephemeral SQLite/upload runtime data.

IMPORTANT: Vercel /tmp storage is ephemeral. For permanent admin data, enquiries, project uploads and uploaded websites, connect a persistent database and object storage before relying on those features in production.

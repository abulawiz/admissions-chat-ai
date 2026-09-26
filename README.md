# Admissions Chat AI

Vite + React + TypeScript admin dashboard backed by Supabase.

## Development

```sh
npm install
cp .env.example .env
npm run dev
```

Run checks before deployment:

```sh
npm run lint
npm run build
npm test
```

## Admin uploads

Create a private Supabase Storage bucket named `admission-documents`. The browser upload uses the signed-in user's session and stores files under `<user-id>/`. The server fallback is limited to 10 MB and requires `SUPABASE_SERVICE_ROLE` on the server only.

## Admin email

The admin email form calls `/api/admin/send-email`. Configure `SENDGRID_API_KEY` and `EMAIL_FROM` as server-side variables. Set `ADMIN_EMAIL` to restrict the endpoint to one administrator, or set the user's Supabase `app_metadata.role` to `admin`. Never put service-role or SendGrid credentials in a `VITE_` variable.

The API routes are Vercel-style serverless functions under `api/`. If deploying elsewhere, configure equivalent routing and multipart parsing for `/api/admin/upload`.

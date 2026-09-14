# Cravin Jamaican Cuisine website

Next.js 15 site (public pages + `/admin` HR panel) deployed on Netlify, with
Supabase for auth, data and private file storage.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the keys (see comments in the file)
npm run dev                  # http://localhost:3000
```

- **The keys point at the live Supabase project.** Anything created locally is
  real production data.
- **Admin sign-in locally:** Google sign-in only returns to localhost if
  `http://localhost:3000/auth/callback` is in Supabase → Authentication → URL
  Configuration → Redirect URLs.
- **Before pushing:** `npm run lint` and `npm run build`. The build also runs
  ESLint and fails on lint errors.

## Database migrations

SQL migrations live in `supabase/migrations/` and are applied by hand, in order,
in the Supabase SQL editor. Apply a migration **before** merging code that
depends on it.

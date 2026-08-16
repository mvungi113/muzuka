This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Muzuka API deployment steps

This is a monorepo: the API lives in `muzukaapi/`, the Flutter app in `muzuka/`.

1. **Import the repo** at [vercel.com/new](https://vercel.com/new) and set:
   - **Root Directory:** `muzukaapi`
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `npm run build` (already runs `prisma generate` before `next build`)
2. **Add the following Environment Variables** (Project → Settings → Environment Variables):

   | Name | Notes |
   |------|-------|
   | `DATABASE_URL` | Supabase pooler connection string (transaction mode) |
   | `DIRECT_URL` | Direct (non-pooled) DB connection, used for Prisma migrations |
   | `SUPABASE_URL` | e.g. `https://xxxx.supabase.co` |
   | `SUPABASE_ANON_KEY` | |
   | `SUPABASE_SERVICE_ROLE_KEY` | server-side only — never expose to clients |
   | `JWT_SECRET` | **Required in production.** Long random string; the app falls back to an insecure dev secret if unset |
   | `NEXT_PUBLIC_APP_URL` | Public base URL of the deployed API |

3. **Database** — the schema must already be applied to your running Postgres
   (e.g. `npx prisma db push` or `prisma migrate deploy`). No migration step is
   wired into the build by default.
4. **Region** — set the Vercel region close to your Supabase instance (e.g. `cdg1`
   for EU West) to reduce latency.
5. Deploy. The API will be served at `/api/*` and the admin UI at `/admin`.

> **Notes**
> - Serverless function default timeout is 10s on Hobby / 60s on Pro. Bump
>   `maxDuration` per route if heavy queries time out.
> - `POST /api/upload` streams the file through the function, so it is subject to
>   Vercel's request body size limit (~4.5 MB on Hobby). For large audio uploads,
>   upload directly to Supabase from the client via a signed URL instead.
> - `middleware.ts` shows a Next.js 16 deprecation warning (`use "proxy"` instead).
>   It still works; migrate later with `npx @next/codemod@canary middleware-to-proxy .`

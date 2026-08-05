# ZIORA — Grace Beyond Modesty

ZIORA is a modern luxury modest fashion e-commerce platform built with Next.js App Router, MongoDB, Auth.js, Cloudinary, and Tailwind CSS.

## Authentication

- Email + password (customer registration only)
- Google OAuth (auto-create customer, never auto-promote admin) — only offered when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Persistent JWT sessions for 30 days
- Role-separated dashboards (`customer` / `admin`)
- Public admin registration is disabled

Required env vars: `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

```bash
# Generate a secret
openssl rand -base64 32
```

Create an admin account with:

```bash
npm run create-admin
```

If OTP email cannot be delivered (offline / SMTP failure), the signup still succeeds and the OTP is printed in the server console in development. To unlock accounts that were created before that fix:

```bash
npm run diagnose:auth
npm run verify-user -- --all-unverified
# or a single address:
npm run verify-user -- you@example.com
```

## Getting Started

```bash
npm install
cp .env.example .env.local
# Fill NEXTAUTH_SECRET, NEXTAUTH_URL=http://localhost:3000, and MONGODB_URI
npm run create-admin
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment

See `.env.example` for:

- MongoDB
- Auth.js / NextAuth secrets (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
- Google OAuth credentials (optional — when blank, the Google button is hidden)
- Cloudinary
- Email/OTP

Google callback URL:

```text
http://localhost:3000/api/auth/callback/google
```

## Tests

```bash
npm test
```

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Auth.js (`next-auth`)
- MongoDB + Mongoose
- Cloudinary
- Nodemailer
- Vitest

## Brand

**ZIORA** — Grace Beyond Modesty

© 2026 ZIORA

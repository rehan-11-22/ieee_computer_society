# IEEE CS Certificate Verification Portal

This Next.js application stores certificates, PNG/JPEG certificate templates, and administrator accounts in MongoDB. Admin passwords are hashed with bcrypt and login sessions use signed, HTTP-only cookies.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Set `MONGODB_URI`, `MONGODB_DB`, and a random `SESSION_SECRET` of at least 32 characters.
3. Install dependencies and seed the demo record:

```bash
npm install
npm run seed
npm run dev
```

`npm run seed` always creates or updates the demo certificate. It also creates or updates an admin account when `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` are set.

Open [http://localhost:3000](http://localhost:3000). The admin dashboard is available at `/login`. There is no public signup route; authenticated admins create additional accounts from the **Admins** screen.

## MongoDB collections

- `certificates` stores certificate records, their verification links, and has a unique index on `credentialId`.
- `certificate_templates` stores uploaded PNG/JPEG backgrounds (maximum 5 MB), metadata, and the default-template flag.
- `admin_users` stores normalized email addresses, an explicit `admin` role, and bcrypt password hashes, with a unique email index.
- `counters` atomically generates sequential IDs such as `IEECS-SU-2026-0002` without browser-side collisions.

Certificate verification and generated PDF downloads remain public. Listing, creating, editing, changing status, and deleting certificates, as well as uploading templates, require a valid administrator session. Leave Credential ID blank in the add form to generate the next ID securely on the server.

## Certificate templates and PDF generation

Open the protected **Templates** screen to upload a valid PNG or JPEG image and optionally make it the default. The image is stored in the isolated MongoDB database rather than the public filesystem. When an admin creates or edits a certificate, they can choose a template. The server generates a landscape PDF containing the dynamic recipient, event, date, issuer, Credential ID, and a clickable verification link. Certificates without an uploaded template continue to use the built-in design.

Set `NEXT_PUBLIC_SITE_URL` in production so the verification link embedded in PDFs points to the public domain. If omitted, the current request origin is used.

## Migrate existing Supabase certificates

Set these environment variables temporarily:

```bash
MONGODB_URI=...
MONGODB_DB=ieee_certificate_portal
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

Then run:

```bash
npm run migrate:supabase
```

The migration is repeatable: records are upserted by Credential ID. Supabase Auth password hashes cannot be exported, so seed the first MongoDB admin with `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`. After login, create additional accounts from the protected **Admins** screen.

## Production deployment

Configure `MONGODB_URI`, `MONGODB_DB`, `SESSION_SECRET`, and `NEXT_PUBLIC_SITE_URL` in the hosting provider. Do not expose the MongoDB URI or session secret through variables prefixed with `NEXT_PUBLIC_`.

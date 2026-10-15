# ClientWave

ClientWave is a multi-tenant outreach workspace built with Next.js, TypeScript, Prisma, Supabase Auth, PostgreSQL, and BullMQ.

## Requirements

- Node.js 20.9 or newer and npm
- Docker Desktop (or Docker Engine with Compose)
- A Supabase project for email-link and Google authentication

## Local setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create your local environment file and a 32-byte key for AES-256-GCM secret encryption:

   ```powershell
   Copy-Item .env.example .env
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Put the generated 64-character hexadecimal value in `API_KEY_ENCRYPTION_KEY`.
   Never commit `.env` or reuse this key across environments.

3. In Supabase, create a project and configure **Authentication > URL Configuration**:

   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`

   Copy the project URL and anon/publishable key to `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Enable email sign-in and Google under **Authentication
   > Providers**; configure the Google OAuth credentials in Supabase. The Supabase
   service-role key is not needed by the app and must never be exposed in browser code.

4. Start local PostgreSQL and Redis:

   ```powershell
   docker compose up -d
   ```

   The local PostgreSQL image creates the `auth.uid()` helper used by the RLS migration.
   Supabase-hosted Postgres already provides this function.

5. Apply the schema and generate the Prisma client:

   ```powershell
   npx prisma migrate dev
   npx prisma generate
   ```

6. Start the web app:

   ```powershell
   npm run dev
   ```

   Open `http://localhost:3000`, sign in by email link or Google, and ClientWave will
   create the user's initial workspace and default settings on the first successful
   authentication.

7. (Optional) Seed the signed-in user's workspace with a demo business profile and
   campaign. Set `SEED_USER_ID` to that user's Supabase Auth UUID and
   `SEED_USER_EMAIL` in `.env`, then run:

   ```powershell
   npm run db:seed
   ```

## Background jobs

Run the worker in a second terminal:

```powershell
npm run worker
```

An authenticated user can enqueue the example job with
`POST /api/campaigns/{campaignId}/prepare`. The route verifies the campaign belongs to
the user's workspace before queueing it. The worker checks that workspace scope again
and records a `campaign.prepared` event.

## Database and tenant isolation

The initial migration creates `users`, `workspaces`, `business_profiles`, `campaigns`,
`icps`, `leads`, `lead_scans`, `messages`, `message_variants`, `sequences`, `send_logs`,
`replies`, `suppression_list`, `events`, `settings`, and `audit_log`. All workspace-owned
tables carry a required `workspace_id`; users are assigned to their initial workspace.
RLS policies scope reads and writes to the authenticated user's workspace. Server-side
Prisma operations must also scope every tenant query by `workspaceId` (as the settings
page and example job do), because the application database connection has elevated
database privileges and bypasses RLS.

The current onboarding model assigns one workspace to each user. Multi-user workspace
membership should be introduced with an explicit membership table before enabling team
invites or workspace switching.

Settings API keys are encrypted in the application with AES-256-GCM. Keep
`API_KEY_ENCRYPTION_KEY` private and back it up securely: losing it makes stored values
undecryptable. The encryption key is intentionally separate from Supabase credentials.

## Quality checks

```powershell
npm run typecheck
npm run lint
npm test
npm run format:check
```

The project uses strict TypeScript, Tailwind CSS, shadcn/ui-compatible configuration,
ESLint, Prettier, and Vitest.

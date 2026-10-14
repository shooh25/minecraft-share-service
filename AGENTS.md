# Project Rules

## Tech Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Auth)
- Cloudflare R2 for image storage
- Vercel for deployment

## Development Rules
- Follow the existing project structure and conventions.
- Use strict TypeScript. Avoid `any`.
- Keep components small and reusable.
- Do not introduce new dependencies without justification.
- Do not implement features outside the agreed scope.
- Run lint, type checks, and relevant tests after changes.
- Update documentation when behavior or schema changes.

## Security
- Never commit secrets or credentials.
- Never expose server-side secrets to the browser.
- Enforce authorization on the server and in database policies.
- Validate uploaded files, file types, and file sizes.
- Never trust user-supplied input.

## Database
- Manage schema changes through version-controlled migrations.
- Define and test appropriate Row Level Security (RLS) policies.
- Add indexes for frequently queried data.
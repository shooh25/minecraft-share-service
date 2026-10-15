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

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

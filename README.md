# home-wallet — household budgeting and shared expenses manager

home-wallet is a lightweight Next.js application that helps households manage shared finances, split shared expenses, and track personal transactions. This repository contains the app foundation and an i18n-ready UI.

## Tech highlights

- Framework: Next.js (App Router)
- i18n: next-intl (cookie-based locale routing)
- Styling: Tailwind CSS + shadcn/ui
- Icons: lucide-react
- Language: TypeScript + React 19

Quick links

- Scripts: `dev`, `build`, `start`, `lint`, `format` (see `package.json`)

## Getting started

1. Install dependencies (uses `pnpm`):

```bash
pnpm install
```

2. Run the development server (the project listens on port 6001 by default):

```bash
pnpm dev
```

Open http://localhost:6001 in your browser.

Project structure (important folders)

- `app/` — Next.js App Router pages and layouts
- `src/components/` — UI atoms, molecules and reusable components
- `src/i18n/` — locale routing and dictionaries
- `src/lib/` — shared utilities and helpers

## Environment & integrations

- This starter does not commit secrets. Configure your own Postgres/Prisma, Auth, or AI API keys as environment variables when adding those features.

Deployment

- The app is compatible with Vercel and any Node 22+ hosting provider. Build with:

```bash
pnpm build
pnpm start
```

## Contributing

- Follow the repository conventions: use `pnpm`, run `pnpm format` and `pnpm lint` before opening PRs.

## Further reading

- See `src/i18n/languages.ts` and `src/i18n/routing.ts` for locale handling.

### License

- This repository does not include a license file. Add one (for example, `LICENSE`) if you intend to open-source the project.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

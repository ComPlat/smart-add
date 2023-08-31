# Smart Add

## Setup

- Install Node.js, version 18.17.1 (LTS)

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Production

## Development

## Testing

Cypress is used for E2E and component tests.

Why Cypress: <https://docs.cypress.io/guides/overview/why-cypress>
Configuration: <https://docs.cypress.io/guides/references/configuration>

To run the testing suite headless in the background, just run

```bash
pnpm e2e:headless
```

for E2E tests or

```bash
pnpm component:headless
```

for component tests.

## Linting

For linting the codebase, ESLint and strict rulesets for Next.js and TypeScript are used for increasing code quality and consistency.

To run the linting, just run

```bash
pnpm lint
```

or

```bash
pnpm lint --fix
```

to automatically fix problems.

# Building with Shelving

A guide to structuring a full-stack TypeScript project on [Shelving](https://github.com/dhoulb/shelving). It describes a proven layout for a project with a React frontend, a Bun HTTP API, and a shared contract package between them — where Shelving provides the schema system, endpoint contracts, request handling, data providers, and UI component library.

Follow the file and folder names in this guide exactly. The layout works because every kind of file has exactly one place it can live, and because the client and server communicate only through typed contracts defined in a shared package.

## Principles

1. **Three top-level packages.** All source code lives in `shared/`, `api/`, or `app/`. `shared/` is the contract layer; `api/` is the server; `app/` is the client.
2. **The contract lives in `shared/`.** Database schemas, endpoint definitions, domain logic, and utilities used by both sides are defined once in `shared/` and imported by both `api/` and `app/`. Neither side ever redeclares a type or a validation rule the other side also needs.
3. **Schema-first.** Data shapes are defined as Shelving schemas (runtime validators), and TypeScript types are *derived* from them with `ValidatorType`. You never write a type by hand and a validator separately.
4. **Hard boundaries, mechanically enforced.** `app/` must never import from `api/`, and `api/` must never import from `app/`. This is enforced by the linter, not by convention (see [Boundaries](#boundaries)).
5. **Dependency injection via a context object.** Handlers and services never construct their own providers (database, external APIs). They receive a single context object, so the same code runs against real providers in production, debug/in-memory providers locally, and mock providers in tests.
6. **Group by domain, not by file type.** Feature code sits in a folder named after the domain entity it handles, with its components, styles, helpers, and tests together.
7. **Every code PR gets a disposable preview environment.** CI deploys a full app + API stack per pull request at deterministic URLs, and tears it down when the PR closes. Reviewing against a real deployment — not just reading the diff — is a core part of the workflow (see [CI](#ci-the-test-gate-preview-environments-and-deployment)).
8. **Document the repo for agents.** An `AGENTS.md` at the repo root is the operating manual LLM coding agents read before working; keeping it current is part of the definition of done (see [AGENTS.md](#agentsmd--make-the-repo-legible-to-llms)).

## Top-level layout

```
project/
├── shared/            # Contract layer: schemas, endpoints, domain logic, shared utils
│   ├── collection/    # Database collection schemas + derived types
│   ├── endpoint/      # Typed endpoint contracts (URL + request/response schemas)
│   ├── config/        # Shared configuration data (e.g. form definitions) built from schemas
│   ├── integration/   # Clients/adapters for external third-party APIs
│   ├── util/          # Generic shared utilities (each file = one topic)
│   ├── img/           # Shared static images
│   └── font/          # Shared font files + their @font-face CSS
├── api/               # Server package
│   ├── start.ts       # Local dev server entry (Bun.serve)
│   ├── worker.ts      # Production serverless/edge entry
│   ├── index.ts       # Request dispatch + top-level error handling
│   ├── handlers/      # Endpoint handlers (thin: attach services to endpoints)
│   ├── services/      # Domain behaviour (the actual work)
│   ├── config/        # Server-side configuration (processors, mappings)
│   └── util/          # Server-only utilities: secrets env, middleware, test helpers
├── app/               # Client package
│   ├── index.html     # HTML shell (production build input)
│   ├── start.html     # HTML shell (local dev, without third-party scripts)
│   ├── index.tsx      # React root mount
│   ├── App.tsx        # Top-level app: route table + global providers
│   ├── start.ts       # Local dev server entry (serves SPA + static assets)
│   ├── style.css      # Global stylesheet entry
│   ├── util/          # Client-only utilities (API client, app context)
│   └── <feature>/     # One folder per functional area (see below)
├── e2e/               # Playwright end-to-end tests (bun:test based)
├── scripts/           # Build/CI helper scripts
├── docs/              # Project documentation
├── .github/
│   └── workflows/     # CI: test gate + per-PR preview deploy, production deploy, smoke, preview teardown
├── AGENTS.md          # Operating manual for LLM coding agents (see the AGENTS.md section)
├── CLAUDE.md          # One line: points agents at AGENTS.md
├── global.d.ts        # Ambient module declarations (CSS modules, image imports)
├── tsconfig.json      # Includes the path aliases for shared/*
├── biome.json         # Lint/format config, including the boundary rules
├── package.json       # Scripts follow the test:* / build:* / start:* pattern
└── test.env           # Committed fake-but-valid env for deterministic test runs
```

## The `shared/` package

`shared/` is imported by both `api/` and `app/`, so **everything in it must be safe to ship to the browser**. No secrets, no server-only dependencies.

### `shared/collection/` — database schemas

One file per collection, plus a barrel `index.ts`. Each file defines:

1. The collection schema with `COLLECTION(...)` from `shelving`.
2. Derived variants with `.pick(...)` etc. (e.g. the "create" payload).
3. Response-shape schemas with `DATA(...)`.
4. The derived TypeScript types via `ValidatorType`.

```ts
// shared/collection/order.ts
import { COLLECTION, DATA, DICTIONARY, OPTIONAL, STRING, StringSchema, TIMESTAMP, UNKNOWN, type ValidatorType } from "shelving";

/** Represent an order in the database. */
export const ORDER = COLLECTION("order", STRING, {
	form: new StringSchema({ title: "Form", min: 1 }),
	date: TIMESTAMP,
	data: DICTIONARY(UNKNOWN),
});
export type Order = ValidatorType<typeof ORDER>;
export type OrderItem = ValidatorType<typeof ORDER.item>;

/** Represent an order that's being created. */
export const CREATE_ORDER = ORDER.pick("form", "data");
export type CreateOrder = ValidatorType<typeof CREATE_ORDER>;

/** Response type for a submitted order. */
export const ORDER_RESULT = DATA({ order: ORDER.item, redirect: OPTIONAL(STRING) });
export type OrderResult = ValidatorType<typeof ORDER_RESULT>;
```

Rules:

- Schema constants are `UPPER_SNAKE_CASE`; derived types are `PascalCase` with the same name.
- The type is always derived from the schema — never written independently.
- `shared/collection/index.ts` is a barrel: `export * from "./order.js";`, one line per module, alphabetically sorted.

### `shared/endpoint/` — endpoint contracts

One file per domain area, plus a barrel `index.ts`. An endpoint is a **value** created with `GET(...)`/`POST(...)` from `shelving`, binding a URL pattern to a request schema and a response schema:

```ts
// shared/endpoint/order.ts
import { CREATE_ORDER, ORDER_RESULT } from "shared/collection";
import { POST } from "shelving";

export const ORDER_ENDPOINT = POST("/order", CREATE_ORDER, ORDER_RESULT);
```

This single constant is the entire client/server contract:

- The **server** imports it and attaches a handler: `ORDER_ENDPOINT.handler(...)`.
- The **client** imports it and calls it through the API provider — with the request and response fully typed and validated on both ends.

Rules:

- Endpoint constants are named `<NOUN>_ENDPOINT`.
- Endpoint files contain only endpoint definitions — no logic.
- Request/response schemas come from `shared/collection` (or `DATA(...)` shapes defined alongside them); endpoints never define ad-hoc inline shapes.

### `shared/config/` — shared configuration data

Configuration that both sides need — e.g. multi-step form definitions built from schema classes. Each config area is a folder with an `index.ts` barrel that also asserts completeness:

```ts
// shared/config/<area>/index.ts
export const FORMS = {
	alpha,
	beta,
} satisfies ImmutableDictionary<FormSchema>;
```

The `satisfies` clause is the pattern to copy: barrels that aggregate config use it to type-check that every entry conforms (and, on the API side, that every shared config entry has a matching server-side counterpart — see `api/config/` below).

### `shared/<domain>/` — shared domain logic

A domain area that needs classes/logic on both sides (e.g. a schema subclass for multi-step forms plus a processor that validates and forwards submissions) gets its own folder: one class per file, named after the class (`FooSchema.ts` exports `FooSchema`), plus a barrel `index.ts`.

### `shared/integration/` — external API adapters

One folder per third-party service: `shared/integration/<service>/` containing the provider class (`<Service>Provider.ts`), a `types.ts` for the wire types, optional `util.ts`, tests, and a barrel `index.ts`. Integrations that hold secrets take them as **constructor arguments** — the secret values themselves are read only in `api/` (see env split below).

### `shared/util/` — shared utilities

Flat folder, one file per topic (`phone.ts`, `cookie.ts`, `env.ts`, …), each with a co-located `<topic>.test.ts`. Two files deserve special mention:

- **`shared/util/env.ts`** — parses *public* environment variables only. It starts with a comment warning that these values are inlined into client bundles. Required values throw at module load: `if (!process.env.API_URL) throw new ReferenceError(...)`. Export parsed values (e.g. `URL` objects via `requireURL`), not raw strings.
- **`shared/util/context.ts`** — defines the `ProviderContext` interface: the single dependency-injection object holding every provider the server needs (database provider, external API providers, config processors). Also defines `ProviderHandlers = EndpointHandlers<ProviderContext>`. Both types are used throughout `api/`; defining them in `shared/` keeps handler signatures importable without touching server code.

## The `api/` package

### Entry points — three composition roots

The API has **no global state**. All providers are assembled into a `ProviderContext` at an entry point and passed down. There are exactly three places that construct a context:

1. **`api/start.ts`** — local dev server. Runs `Bun.serve` on the port derived from the `API_URL` env var. Builds a context from debug/in-memory providers (`MemoryDBProvider` wrapped in `DebugDBProvider`, mock external APIs wrapped in `DebugAPIProvider`), wraps the handler in logging + CORS middleware.
2. **`api/worker.ts`** — production serverless/edge entry. Builds a context from real providers (persistent KV/database provider, real external API clients wrapped in `LoggingAPIProvider`) using secrets from `api/util/env.ts`.
3. **`api/util/test.ts`** — test helper exporting `createMockAPIContext()`, which builds a context entirely from `Mock*` providers so tests exercise handlers in-process with no network I/O.

Because the context interface is the same in all three, handlers and services are identical across dev, production, and test.

### `api/index.ts` — dispatch

One exported function, `handleAPI(request, context)`, which delegates to Shelving's `handleEndpoints(API_URL, HANDLERS, request, context, handleAPI)` and converts anything thrown into an error `Response` with `getErrorResponse(thrown, DEBUG)` (the `DEBUG` flag prevents leaking error details in production). All top-level error handling lives here and nowhere else.

### `api/handlers/` — thin handler lists

One file per domain area plus an `index.ts` that assembles the master list. A handler file imports the endpoint from `shared/endpoint`, attaches `.handler(...)`, and immediately delegates to a service:

```ts
// api/handlers/order.ts
import { ORDER_ENDPOINT } from "shared/endpoint";
import type { ProviderHandlers } from "shared/util/context";
import { createOrder } from "../services/order.js";

export const ORDER_HANDLERS: ProviderHandlers = [
	ORDER_ENDPOINT.handler((create, _request, context) => {
		return createOrder(create, context);
	}),
];
```

`api/handlers/index.ts` exports `HANDLERS: ProviderHandlers` — a flat array spreading each area's handlers, plus tiny inline handlers for infrastructure routes (`GET("/")` health check, `robots.txt`, `favicon.ico`).

Rules:

- Handlers contain **no domain logic** — they unpack the request and call a service.
- Handler arrays are named `<AREA>_HANDLERS`.
- Handlers return plain data; Shelving validates it against the endpoint's response schema.

### `api/services/` — domain behaviour

One file per domain entity; functions named as verbs (`createOrder`, not `orderCreate`). A service receives validated payload + `ProviderContext`, performs the work (validate deeper, write via `context.db`, forward via context providers), and returns the response-shape data. Co-located `*.test.ts` files test services through `createMockAPIContext()`.

### `api/config/` — server-side configuration

Mirrors `shared/config/` folder-for-folder. Where `shared/config/<area>/` defines *what the data looks like* (schemas — needed by the client to render forms), `api/config/<area>/` defines *what the server does with it* (processors, forwarding/mapping to external systems — server-only because it encodes business rules and touches secret-bearing providers). The `api/config/<area>/index.ts` barrel uses `satisfies { [K in keyof typeof SHARED_CONFIG]: ... }` to force a compile error if a shared config entry is missing its server counterpart.

### `api/util/` — server-only utilities

- **`api/util/env.ts`** — parses *secret* environment variables (API keys etc.). Starts with a comment: "these values are server-side secrets — only import this file in API code, never in APP code."
- **`api/util/middleware.ts`** — request middleware as higher-order functions named `with*`: `withCORS(handler)`, `withLogging(handler)`. Each takes a `RequestHandler` and returns a new one.
- **`api/util/test.ts`** — the mock-context factory described above, plus shared test fixtures.

## The `app/` package

### Entry points

- **`app/index.html`** — production HTML shell. References `./style.css` and `./index.tsx`; the bundler resolves and bundles from here.
- **`app/start.html`** — identical shell for local dev, minus any third-party scripts you don't want running locally.
- **`app/index.tsx`** — mounts `<App />` into `#root`. Nothing else.
- **`app/App.tsx`** — the composition root of the client: the `ROUTES` table, the app-level context value, and the provider tree (Shelving's `App`, `Navigation`, `PageCatcher`, `Router`, `Dialogs`, `Notices`). Every page component is registered here.
- **`app/start.ts`** — local dev server: `Bun.serve` on the port derived from `APP_URL`, serving the HTML shell for all SPA routes and static files (e.g. `/img/*` mapped to `shared/img/`).

### Routing

Routes are declared as a plain object mapping path patterns to page components, using Shelving's `Router`:

```tsx
const ROUTES: Routes = {
	"/": HomePage,
	"/order/{form}": OrderPage,
	"/debug/{path}": DEBUG && DebugPage, // conditionally registered routes use && with an env flag
	"/**": () => <ErrorPage reason="Page not found" />,
};
```

### Feature folders

Everything below the entry points is grouped **by functional area**, one folder per domain entity: `app/<feature>/`. A feature folder holds, together:

- The page component: `<Feature>Page.tsx` (+ `<Feature>Page.module.css` if it needs page-specific layout).
- Feature-local components, each `PascalCase.tsx` with a matching `.module.css` when styled.
- Feature-local hooks and helpers.
- Co-located `*.test.ts` files.

Never create `app/components/`, `app/hooks/`, or other type-based folders. If a component is generic enough to leave its feature folder, it belongs in the Shelving UI library (`shelving/ui`), not in a app-level shared folder.

### `app/util/`

Client-only cross-feature utilities. Two standard files:

- **`app/util/api.ts`** — the single API client instance: `export const API = new ClientAPIProvider({ url: API_URL });`. All features call endpoints through this.
- **`app/util/context.ts`** — the app-level React context: an `AppContextData` interface, the `createContext` value, and a `requireAppContext()` accessor that throws if used outside the provider.

### Component conventions

- Components are named function declarations returning `ReactElement` — not arrow functions, not `JSX.Element`.
- Page components use the `*Page` suffix and are registered in `App.tsx`. Layout components use the `*Layout` suffix.
- **No inline `style` props, ever.** All styling lives in `.module.css` files named after their component (`OrderPage.module.css` for `OrderPage.tsx`).
- Reusable components expose styling options as **variants**: boolean props mapped to class names in the CSS module. Pages compose existing `shelving/ui` primitives (`Button`, `Notice`, `Page`, `Row`, layouts, transitions) rather than styling raw elements.

## Boundaries

Three mechanisms keep the packages honest:

1. **Linter-enforced import bans** (Biome `noRestrictedImports` overrides):
   - Files under `app/**` may not import `api/**` — "Client bundles must not import server-only modules".
   - Files under `api/**` may not import `app/**` — "API code must not import client modules".
   - `shared/**` imports neither, by construction (nothing in it references the other packages).
2. **The env split.** Public env vars are parsed only in `shared/util/env.ts`; secret env vars only in `api/util/env.ts`. A secret can never leak into a client bundle because the only file that reads it is un-importable from `app/`.
3. **Path aliases.** Cross-package imports of `shared/` go through bare aliases defined in `tsconfig.json` `paths`, which also enforce that folders with barrels are imported *as* the barrel:

```jsonc
"paths": {
	"shared/collection": ["./shared/collection/index.ts"],
	"shared/config/*": ["./shared/config/*/index.ts"],
	"shared/endpoint": ["./shared/endpoint/index.ts"],
	"shared/integration/*": ["./shared/integration/*/index.ts"],
	"shared/img/*": ["./shared/img/*"],
	"shared/font/*": ["./shared/font/*.css"],
	"shared/util/*": ["./shared/util/*.ts"]
}
```

Import rules that follow:

- Cross-package imports use the alias, no `.js` suffix: `import { ORDER_ENDPOINT } from "shared/endpoint";`.
- Relative imports within a package use explicit `.js` extensions: `import { createOrder } from "../services/order.js";`.
- Type-only imports use `import type` (enforced by `verbatimModuleSyntax`).
- Core types and utilities come from `shelving` (and `shelving/ui` for components) — don't reimplement what the library provides.

A `global.d.ts` at the root declares the ambient module types for `*.module.css`, `*.css`, and image imports so the aliases type-check.

## Testing layout

Three tiers, all on `bun:test`:

1. **Unit tests** — co-located with source as `<name>.test.ts`, in all three packages. The unit test script runs `bun test` across `app api shared`.
2. **In-process API tests** — service/handler tests build a context with `createMockAPIContext()` from `api/util/test.ts` and call services directly. No server, no network.
3. **E2E tests** — in the top-level `e2e/` folder: `*.test.ts` files driving Playwright, plus support modules (`device.ts` for browser/device setup, `steps.ts` for reusable step runners, `env.ts`, `debug.ts`). Tests safe to run against a live deployment include `@smoke` in their name, so a smoke run is just `bun test e2e -t @smoke`.

Environment handling for tests:

- **`test.env`** is a committed, fake-but-valid env file. Test scripts load it explicitly with `--no-env-file --env-file=test.env` so runs are deterministic regardless of local `.env`.
- Do **not** name it `.env.test` — Bun auto-loads that during `bun test`, which makes smoke/manual runs target the wrong URLs.
- **`scripts/startWhile.ts`** boots the app + API on per-run derived ports, waits until they're reachable, runs the wrapped command (the e2e suite), then tears them down. This gives the e2e script a self-contained one-command run.

## Scripts and commands

`package.json` scripts follow a strict prefix pattern so groups can be run with `--parallel`/`--sequential` wildcards:

```jsonc
"scripts": {
	"test": "bun run --parallel test:*",          // the full local gate
	"test:lint": "biome check .",
	"test:type": "tsgo --noEmit",
	"test:unit": "bun --no-env-file --env-file=test.env test --concurrent app api shared",
	"test:e2e": "bun --no-env-file --env-file=test.env run scripts/startWhile.ts bun test e2e",
	"fix": "bunx biome check --write",
	"build": "bun run --sequential build:api build:app",
	"build:app": "bun build app/index.html --target=browser --env=inline --minify --outdir=.build/app",
	"build:api": "bun build api/worker.ts --env=inline --outfile=.build/api/worker.js",
	"start": "bun run --parallel start:*",
	"start:app": "bun run app/start.ts",
	"start:api": "bun --watch run api/start.ts"
}
```

Conventions:

- `test:*` scripts are the CI gate; plain `test` runs them all.
- Builds output to `.build/` (git-ignored, never hand-edited). `postbuild:*` scripts can verify the bundle (e.g. grep the output to confirm no secret env values were inlined into the client bundle — a cheap, high-value safety check).
- Servers derive their ports from `APP_URL`/`API_URL` env vars rather than hardcoding or taking `--port` flags, so every environment (dev, test, CI, prod) is configured the same way.

Required public env vars follow the same shape: `DEBUG`, `APP_URL`, `API_URL` (plus any project-specific public URLs), validated eagerly in `shared/util/env.ts` so a misconfigured environment crashes at boot, not mid-request.

## CI: the test gate, preview environments, and deployment

This is a **key part of the workflow**, not an afterthought. Every code pull request gets its own fully deployed, disposable preview environment — real app, real API, at URLs derived from the PR number — and production deploys automatically on merge to the default branch. Review happens against a live deployment, not just a diff.

The setup is four workflows in `.github/workflows/`. The hosting below is described using Cloudflare (Pages for the static app bundle, Workers for the API) as the example technology — any host that supports named/branch deployments for static sites and named serverless deployments for the API works the same way.

| Workflow | Trigger | What it does |
|---|---|---|
| `deploy-preview.yml` | PR `opened` / `synchronize` / `reopened` | Full test gate, then deploy a per-PR preview environment and post a sticky PR comment with the URLs |
| `deploy-prod.yml` | Push to `main` | Full test gate, then deploy to production |
| `smoke.yml` | `deployment_status` success (+ manual dispatch) | Run `@smoke`-tagged e2e tests against the freshly deployed URL |
| `teardown-preview.yml` | PR `closed` | Delete the per-PR deployments and update the sticky comment |

### The preview workflow (`deploy-preview.yml`)

Structure — two jobs, deploy gated on test:

```yaml
name: Deploy Preview

on:
  pull_request:
    types: [opened, synchronize, reopened]
    paths-ignore:
      - '**/*.md'
      - 'docs/**'

permissions:
  contents: read
  deployments: write
  pull-requests: write

concurrency:
  group: preview-pr-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: oven-sh/setup-bun@v2
      # Cache the package-manager cache AND the e2e browser binaries, both keyed on the lockfile.
      - uses: actions/cache@v5
        with:
          path: ~/.bun/install/cache
          key: bun-${{ runner.os }}-${{ hashFiles('bun.lock') }}
      - uses: actions/cache@v5
        id: playwright-cache
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('bun.lock') }}
      - run: bun install --frozen-lockfile
      - if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: bunx playwright install chromium
      - run: bun run test        # the FULL gate: lint + type + unit + e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    env:
      SLUG: pr-${{ github.event.pull_request.number }}
      WORKER_NAME: pr-${{ github.event.pull_request.number }}-api
      APP_URL: https://pr-${{ github.event.pull_request.number }}.${{ vars.PAGES_SUBDOMAIN }}.pages.dev
      API_URL: https://pr-${{ github.event.pull_request.number }}-api.${{ vars.WORKERS_SUBDOMAIN }}.workers.dev
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
    environment:
      name: preview
      url: https://pr-${{ github.event.pull_request.number }}.${{ vars.PAGES_SUBDOMAIN }}.pages.dev
    steps:
      - uses: actions/checkout@v6
      - uses: oven-sh/setup-bun@v2
      # ... same bun cache + install steps ...

      # Env values are BAKED INTO the bundles at build time (--env=inline),
      # so write .env from a single multi-line repo secret before building.
      - name: Write .env
        run: |
          cat > .env <<'EOF'
          ${{ secrets.ENV_PREVIEW }}
          EOF
          [ -s .env ] || (echo "ENV_PREVIEW is empty" && exit 1)

      - run: bun run build:app
      - run: bun run build:api

      # Static bundle → branch-named deployment; API bundle → per-PR named worker.
      - run: bunx wrangler@4.71.0 pages deploy .build/app --project-name ${{ vars.PAGES_SUBDOMAIN }} --branch ${{ env.SLUG }}
      - run: bunx wrangler@4.71.0 deploy .build/api/worker.js --name ${{ env.WORKER_NAME }}

      - name: Post PR comment
        uses: actions/github-script@v8
        with:
          script: |
            # Sticky-comment pattern: first line is a fixed marker; find a comment
            # starting with the marker and update it, otherwise create it.
            # Body: a small table with App URL, API URL, worker name, short commit SHA.
```

The load-bearing decisions, each worth copying:

1. **Deterministic URLs derived from the PR number.** The slug `pr-<n>` names everything: the Pages branch alias (`pr-<n>.<project>.pages.dev`), the Worker (`pr-<n>-api`), the concurrency group. Anyone — human or LLM — can compute the preview URLs from the PR number alone, without reading the PR comment or querying the host.
2. **`paths-ignore` for docs.** Both deploy workflows ignore `'**/*.md'` and `'docs/**'`. Deploying because a README changed is pure waste. The trade-off (see gotchas below) is that docs-only PRs get *no* preview, which agents must know about.
3. **Deploy gated on the full test gate.** The `deploy` job has `needs: test`, and `test` runs the *entire* local gate (`bun run test` = lint + type + unit + e2e), not a subset. Partial gates let e2e regressions reach deployed previews.
4. **Per-PR concurrency with `cancel-in-progress`.** Group `preview-pr-<n>` means a new push cancels the previous in-flight run — only the latest commit's preview survives, and runs for different PRs never queue behind each other.
5. **One multi-line env secret per environment.** The whole `.env` file lives in a single repo secret (`ENV_PREVIEW`, `ENV_PROD`) that the workflow writes to disk before building. One place to rotate, and the `[ -s .env ]` guard fails fast if the secret is missing/empty. Because builds use `--env=inline`, env values are frozen into the bundle — changing an env value means rebuilding and redeploying, not editing host config.
6. **The sticky PR comment.** The comment starts with a fixed marker line (`### Preview Environment`); each deploy finds the existing comment by that marker and updates it rather than posting a new one. The PR thread stays clean and always shows the current state.
7. **GitHub `environment:` on the deploy job.** Declaring `environment: {name, url}` creates a GitHub Deployment, which (a) shows the preview link directly on the PR, and (b) emits the `deployment_status` event that triggers the smoke workflow.
8. **Pinned deploy CLI.** `bunx wrangler@<exact-version>` — an unpinned deploy tool is a supply-chain and reproducibility risk in CI.
9. **Cache the package cache and browser binaries keyed on the lockfile.** Two `actions/cache` entries (package-manager cache, Playwright browsers), both keyed on `hashFiles('bun.lock')`, keep the test job fast.

### The production workflow (`deploy-prod.yml`)

Identical shape, different trigger and targets:

- Trigger: `push` to `main`, with the same `paths-ignore` for `**/*.md` and `docs/**`.
- Same two-job `test` → `deploy` structure, same `.env`-from-secret pattern (`ENV_PROD`).
- Deploys the static bundle to the production branch alias (`--branch main`) and the API to the fixed production worker name (`api`).
- Concurrency group `deploy-prod` with `cancel-in-progress: true` — rapid merges collapse into one deploy of the latest commit.
- `environment: {name: production, url: <prod app URL>}` so production deploys also trigger smoke.

### The smoke workflow (`smoke.yml`)

Runs the `@smoke` subset of the e2e suite against whatever was just deployed:

```yaml
on:
  deployment_status:      # fired by any deploy job that declares `environment:`
  workflow_dispatch:      # manual runs against the configured APP_URL

jobs:
  smoke:
    if: github.event_name == 'workflow_dispatch' || github.event.deployment_status.state == 'success'
    steps:
      # ... checkout, bun + playwright setup with the same caches ...
      - name: Use deployment URL as APP_URL
        if: github.event.deployment_status.environment_url
        run: echo "APP_URL=${{ github.event.deployment_status.environment_url }}" >> "$GITHUB_ENV"
      - run: bun run smoke   # bun test e2e -t @smoke, against $APP_URL
```

Notes:

- `deployment_status` fires for **both** preview and production deployments — one workflow smoke-tests everything, because the target URL comes from the event (`environment_url`), not from config.
- Only e2e tests with `@smoke` in the test name run. Keep `@smoke` on exactly the cases that are safe and meaningful against a live deployment (idempotent flows, test-mode forms) — never destructive ones.
- If production sits behind bot protection / a WAF, give the smoke runner a shared-secret bypass header (sent on every Playwright request, matched by a WAF "skip" rule) via a secret env var; leave it unset for local/preview runs that aren't behind the WAF.

### The teardown workflow (`teardown-preview.yml`)

Previews are disposable — tear them down when the PR closes (merged or not):

- Trigger: `pull_request: types: [closed]`, same per-PR concurrency group.
- Delete the per-PR worker by name (`wrangler delete pr-<n>-api --force || true` — `|| true` because a docs-only PR never deployed one).
- Delete the static-host deployments for the PR: list the project's deployments as JSON, filter to those matching the PR slug (by branch name, alias, or URL), delete each by id. This matching-by-slug step is the fiddliest part — deterministic slugs (decision 1 above) are what make it possible.
- Mark the PR's GitHub Deployments `inactive` and delete them, so the PR doesn't show stale "Active" environments.
- Update the sticky PR comment to say the preview has been torn down.

### Gotchas (read these before touching CI)

- **`.md` and `docs/**` changes do not trigger previews or deploys.** This is the `paths-ignore` working as intended, but it has consequences an LLM must anticipate: a docs-only PR gets no preview environment and its deploy-gated checks may show as skipped; a docs-only merge to `main` does **not** redeploy production. If you genuinely need a preview for a docs-only PR, include a code change or run the deploy manually. Conversely: don't wait for a preview URL to appear on a docs-only PR — it never will.
- **A new push cancels the in-flight deploy.** If you push twice quickly, the first run is cancelled mid-way by `cancel-in-progress` — a cancelled run is not a failure. Judge preview state by the *latest* run and the commit SHA in the sticky comment.
- **Env is frozen at build time.** With `--env=inline` builds, changing `ENV_PREVIEW`/`ENV_PROD` does nothing to already-deployed bundles. Rebuild and redeploy (push a commit, or re-run the deploy workflow).
- **Preview and production must not share state.** The per-PR worker gets its own bindings; keep preview database/KV namespaces separate from production (e.g. a `preview_id` binding alongside the production id in the worker config).
- **Smoke failures against previews can be opaque** (process kills with no output). The diagnostic loop: reduce the failing e2e test to its first steps, add `console.debug` checkpoints around suspect boundaries, re-push to re-trigger the preview + smoke run, and read which checkpoints printed in the Actions logs.

## AGENTS.md — make the repo legible to LLMs

**Create an `AGENTS.md` file at the repository root so LLM coding agents can understand the codebase.** This is not optional documentation — for a project maintained with agent assistance, `AGENTS.md` is the agents' operating manual, and an agent that hasn't read it will misplace files, skip the test gate, and violate conventions it had no way to know about. Pair it with a minimal `CLAUDE.md` that forces the read:

```md
# CLAUDE.md

Read `AGENTS.md` at the start of every session before doing any work.
```

### Required sections

Write `AGENTS.md` with these sections, in this order. Keep every claim current — a stale map is worse than no map, because agents trust it over re-discovering the code.

1. **Project Snapshot** — runtime/tooling, the three packages, where reusable components come from, and a pointer to this guide for structural rationale.
2. **Fast Start** — install command, run command, local URLs, and the required/optional env vars (with what breaks when each is missing).
3. **Canonical Commands** — the exact commands for lint, type-check, unit tests, the full gate, e2e/smoke variants, and build. Agents should never have to guess a script name.
4. **CI & Deployment** — the workflow list from the [CI section](#ci-the-test-gate-preview-environments-and-deployment) above, condensed to the facts an agent needs mid-task: what triggers a preview, the deterministic preview URL scheme, that `.md`/docs changes don't trigger deploys, that env is baked at build time, and that concurrent pushes cancel in-flight deploys.
5. **Current Known Baseline** — dated statement of which gate commands currently pass. When an agent's change breaks this, updating the section is part of the change.
6. **Repository Map** — one line per important file/folder: entry points, handler/service/config folders, the shared contract folders, the env-parsing files (flagging which is public and which is secret).
7. **File Organization Rules** — the placement rules from this guide, restated imperatively ("`api/handlers`: request handlers only…"). This is the section that stops files landing in the wrong place.
8. **Component / Coding Conventions** — naming, styling rules (no inline styles, CSS-module variants), import rules (aliases vs `.js` relative paths), TypeScript settings that bite (`verbatimModuleSyntax`, `exactOptionalPropertyTypes`), error-handling and logging conventions.
9. **Architecture Notes** — the handful of decisions everything hangs off: routing, endpoint contracts + context injection, the enforced import boundaries, how servers derive ports from URLs.
10. **Agent Workflow Recommendations** — what to run before coding and before finishing (the full gate, autofix), and any UI-verification steps.
11. **Common Pitfalls** — every trap that has actually cost time (env auto-loading quirks, port assumptions, cache issues). This section is earned, not written up front.

### Maintenance rules

Write these into `AGENTS.md` itself, so agents keep it alive:

- Treat `AGENTS.md` as **ongoing memory**: when the user says "add instructions", "remember to do this", or "always do this", the rule goes in this file.
- When a convention is discovered that isn't written down, write it down in the matching section.
- When the baseline changes (a gate command starts failing), update **Current Known Baseline** with the exact failing command and file.
- Refactoring the file for clarity is encouraged; letting it drift from reality is the one failure mode to avoid — an agent reading a stale map will confidently do the wrong thing.

## Style essentials

The broader coding style is a project choice, but these rules interact directly with the layout above:

- **Naming:** `PascalCase` for types/classes/components; `camelCase` for functions/variables; `UPPER_SNAKE_CASE` for exported constants (schemas, endpoints, handler lists, config dictionaries). Module-private functions and constants get a `_` prefix and are not exported.
- **One component per file**, file named after its export. Test files co-located as `*.test.ts`.
- **Barrels:** every multi-file `shared/` folder has an `index.ts` of alphabetised `export * from "./Module.js";` lines, and the tsconfig alias points at it.
- **Verb prefixes carry contracts:** `require*` throws when missing; `get*` returns `undefined` instead; `with*` returns a wrapped/updated copy (including middleware); `handle*` is a top-level request entry point; `format*`/`parse*` are display/parse pairs. Pick the prefix that matches the behaviour.
- **Errors:** user-facing errors are thrown as plain strings (`throw "Unknown form";`) and surfaced by the UI notice system; unexpected errors use Shelving's typed error classes (`RequiredError`, `UnexpectedError`, `ResponseError`).
- **Logging:** `console.log` is banned by the linter; use `console.debug`/`console.warn`/`console.error`.

## Checklist for adding a new domain feature

Adding a feature called `order` touches these files, in this order:

1. `shared/collection/order.ts` — collection schema, create/pick variants, result schema, derived types. Add to `shared/collection/index.ts`.
2. `shared/endpoint/order.ts` — `export const ORDER_ENDPOINT = POST("/order", CREATE_ORDER, ORDER_RESULT);`. Add to `shared/endpoint/index.ts`.
3. *(If both sides need config/domain classes)* `shared/config/order/` and/or `shared/order/`, with barrels.
4. `api/services/order.ts` — `createOrder(create, context)` doing the actual work, plus `order.test.ts` using the mock context.
5. `api/handlers/order.ts` — `ORDER_HANDLERS` attaching the endpoint to the service. Spread into `api/handlers/index.ts`.
6. *(If the server needs its own config)* `api/config/order/`, keeping the `satisfies` completeness check in its barrel.
7. `app/order/OrderPage.tsx` (+ feature-local components/styles/tests in `app/order/`).
8. Register the route in `app/App.tsx`.
9. Run the full test gate locally, then open a PR — CI runs the same gate and deploys a preview environment at the deterministic per-PR URLs. Verify the feature against the live preview (smoke tests run against it automatically) before merging.

If every file in that list is in the right place, the client and server share one schema, one endpoint contract, and zero duplicated types.

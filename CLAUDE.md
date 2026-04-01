# shelving

TypeScript data toolkit with modules for schema validation, database providers, state stores, React integration, and more.

## Modules

Source lives under `modules/`:

- `api` — API request/response handling
- `cloudflare` — Cloudflare Workers KV provider
- `db` — Database abstraction (providers, collections, stores)
- `error` — Error classes
- `firestore` — Firestore providers (client, lite, server)
- `iterate` — Iterable utilities
- `markup` — Markup/HTML utilities
- `react` — React hooks and context
- `schema` — Schema validation
- `sequence` — Sequence utilities
- `store` — State stores
- `test` — Test utilities
- `util` — General utilities (arrays, objects, strings, functions, etc.)

## Commands

**After making any code changes, always run:**

```sh
bun run fix
```

This runs Biome to auto-fix lint errors and reformat code.

**To check for errors:**

```sh
bun run test          # run all checks in parallel
bun run test:lint     # Biome lint check only
bun run test:type     # TypeScript type check only
bun run test:unit     # Bun unit tests only
```

**To build the dist:**

```sh
bun run build
```

## Tooling

- **Biome** — linting and formatting (`biome.json`)
- **TypeScript** — strict mode with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, etc. (`tsconfig.json`)
- **Bun** — test runner (`bun test`)

## Code Style

### Naming

- Prefer single-word names; use `s` suffix for plurals: `item` / `items`, `key` / `keys`
- Function naming prefixes:
  - `is*` — type guard returning `boolean`: `isArray`, `isString`
  - `assert*` — throws if invalid: `assertArray`, `assertString`
  - `get*` — returns value or `undefined`: `getString`, `getData`
  - `require*` — throws if missing: `requireFirst`, `requireString`
  - `with*` — returns immutable updated copy: `withProp`, `withArrayItem`

### Variables

- Prefer `{ name }` destructuring over `obj.name` property access
- Prefix unused function arguments with `_` to avoid lint errors: `_event`, `_value`

### Imports/Exports

- Always use `.js` extension in import paths: `import { x } from "./x.js"`
- Named exports only — no default exports
- Barrel files (`index.ts`) re-export with `export * from "./X.js"`

### Types

- `readonly` on properties and arrays by default
- Type guards use `value is T` return type
- Assertion functions use `asserts value is T` return type

### Functions

- Regular `function` declarations for public API exports
- Arrow functions for short utilities, callbacks, and one-liners

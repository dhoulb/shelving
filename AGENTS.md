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

## Repository Structure

- `modules/` is the TypeScript source root and `dist/` is generated output from `tsc`; do not edit `dist/` by hand
- Tests are colocated with source files as `*.test.ts`
- Utility files are typically lowercase (`modules/util/object.ts`), while class and schema files are typically PascalCase (`modules/schema/StringSchema.ts`, `modules/db/provider/CacheDBProvider.ts`)
- React files only use `.tsx` when they contain JSX; typed React helpers without JSX stay in `.ts`
- Public docs can lag behind the implementation. If `README.md` or older module docs conflict with code, trust source, tests, `package.json`, and this file

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

## Public API

- When adding or removing a public export, update the nearest barrel file in `modules/**/index.ts`
- If you add or remove a public package subpath, also update `package.json` `exports`
- `modules/index.ts` intentionally excludes peer-dependency modules like `react` and `firestore/*`, plus internal `test` helpers, from the root package export. Preserve that split unless you are intentionally changing the public package surface

## Commits

- Use [Conventional Commits](https://www.conventionalcommits.org/) format for all commit messages, for example: `feat: add cache provider` or `fix: handle undefined schema value`
- Commit types feed semantic-release versioning
- `feat:` triggers a minor release
- `fix:` triggers a patch release
- While the project is still on `v0`, do not use `BREAKING CHANGE:` footers or `!` commit markers to trigger a major release
- If a change is breaking in practice, describe it clearly in the commit body or PR, but keep the commit type within the non-major release flow for now

## Code Style

### Naming

- Prefer single-word names; use `s` suffix for plurals: `item` / `items`, `key` / `keys`
- Function naming prefixes:
  - `is*` — type guard returning `boolean`: `isArray`, `isString`
  - `assert*` — throws if invalid: `assertArray`, `assertString`
  - `get*` — returns value or `undefined`: `getString`, `getData`
  - `require*` — throws if missing: `requireFirst`, `requireString`
  - `with*` — returns immutable updated copy: `withProp`, `withArrayItem`
  - `omit*` — returns immutable updated copy: `omitProp`, `omitArrayItem`
  - `toggle*` — toggles immutable updated copy where that helper exists, for example `toggleArrayItem`

### Variables

- Prefer `{ name }` destructuring over `obj.name` property access
- Prefix unused function arguments with `_` to avoid lint errors: `_event`, `_value`

### Imports/Exports

- Always use `.js` extension in import paths: `import { x } from "./x.js"`
- Named exports only — no default exports
- Barrel files (`index.ts`) re-export with `export * from "./X.js"`
- Keep barrel exports in sync when moving or adding files
- Never import from barrel files

### Types

- `readonly` on properties and arrays by default
- Type guards use `value is T` return type
- Assertion functions use `asserts value is T` return type

### Functions

- Regular `function` declarations for public API exports
- Arrow functions for short utilities, callbacks, and one-liners
- File-local helper functions are commonly prefixed with `_`
- Public exports usually have short JSDoc comments; keep them updated when changing behavior
- Prefer existing helpers like `withProp`, `withProps`, `omitProps`, `updateData`, `getFilters`, `getOrders`, `getUpdates`, and `validateData` over open-coded object/query/update logic
- Many immutable helpers intentionally return the original reference when nothing changed. Preserve that behavior where possible instead of always cloning

### Schemas, Queries, and Updates

- Schema classes usually export both the class and ready-made constants or factories, for example `StringSchema` plus `STRING`, or `DataSchema` plus `DATA` / `PARTIAL` / `ITEM`
- Schema defaults and coercions are part of the intended behavior. Before changing them, check the colocated tests for the current contract
- Query and update APIs use encoded key syntax like `$order`, `$limit`, `!key`, `key[]`, `key>`, `=key`, `+=key`, and `+[]key`. Extend these via shared helpers rather than bespoke parsing in each provider
- Collections are defined with `Collection` / `COLLECTION` from a collection name, an id schema, and a data schema. Provider code should operate in terms of `Collection`, not loose strings plus ad-hoc validators

### Error Handling

- Schema validation errors throw a `string` (human-readable message like `"name: Must be 5-50 characters"`). Let these propagate as-is when they represent user input errors — form handlers and UI layers consume these strings directly.
- Only wrap validation strings in a typed error (e.g. `ResponseError`, `ValueError`) when the error is a system/transport problem rather than a user input problem. For example, a bad API response body is a server error (`ResponseError` code 422), not a user error.
- Aggregated validation failures use `"key: message"` lines joined by `\n`. Preserve that format for multi-field and nested validation errors
- `validateData()` strips excess keys and removes `undefined` outputs. Keep that behavior unless you are intentionally changing the validation contract

### Providers, Stores, and React

- DB and API providers are layered wrappers. Prefer extending existing provider chains such as `Through*Provider`, `Validation*Provider`, and `Cache*Provider` patterns instead of duplicating logic
- Wrapped providers are discovered through `source` and helpers like `getSource()` / `requireSource()`, not by reaching into private internals
- `Store.value` intentionally supports suspense-like reads: it can throw a `Promise` while loading or throw `reason` on failure. Do not simplify this into nullable return values
- Store implementations suppress duplicate emissions when values are equal and use the `NONE` sentinel for loading state. Preserve those semantics in new store types
- React context helpers return both a provider component and typed hooks, for example `createDataContext()` and `createCacheContext()`. Follow that pattern for new React integrations

## Testing

- Use `bun:test` and place tests next to the module they cover
- When changing runtime behavior, update or add the closest colocated `*.test.ts`
- When changing TypeScript inference or public generic behavior, include compile-time assignment checks in tests in addition to runtime assertions
- Reuse fixtures and helpers from `modules/test/` when they fit, especially for collection, provider, and query tests
- Test files always import from barrel file (highest possible), so the test also ensures the barrel export
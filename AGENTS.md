# shelving

TypeScript data toolkit with modules for schema validation, database providers, state stores, React integration, and more.

## Modules

Source lives under `modules/`:

- `api` — API request/response handling
- `bun` — Bun PostgreSQL provider
- `cloudflare` — Cloudflare Workers providers (KV, D1)
- `db` — Database abstraction (providers, collections, stores, migrations)
- `error` — Error classes
- `firestore` — Firestore providers (client, lite, server)
- `markup` — Markdown renderer for user-facing content
- `react` — React hooks and context
- `schema` — Schema validation
- `sequence` — Async-iterable utilities
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

## Style

These are stylistic habits the codebase uses pervasively. They aren't enforced by Biome or TypeScript — match them anyway, even when an alternative would technically work. Deviations get refactored, so respect them on first pass.

### Destructuring

- Always destructure when reading 2+ properties from the same object — `const { method, url } = request`, not `request.method` and `request.url`
- Destructure even single properties when the source name is long: `const { requireSource } = require...()`
- Rename on destructure with `:` to disambiguate or to mark validation state: `const { data: unsafeData } = ...`, `const { data: rawValue } = ...`
- Function parameters destructure inline in the signature, including renames: `function foo({ key, data: unsafeData }: Args) { ... }`
- Methods on a class destructure `this`: `const { state, props } = this`

### Coercion

- Use `.toString()` on values, not `String(value)`
- Use `Number.parseInt` / `Number.parseFloat` over the `Number(...)` global; only use `Number(...)` when no method-form alternative exists
- Use `!!x` for boolean coercion

### Truthy and nullish

- Prefer truthy checks over explicit `=== undefined` / `=== null` / `=== ""`: write `if (!value) return ...`, not `if (value === undefined || value === "")`
- Use `||` (not `??`) when empty string and zero should also fall through to the default — this is the common case
- Reserve `??` for narrow null/undefined defaults, especially `process.env.X ?? ""`
- Use optional chaining + truthiness liberally: `if (items?.length) ...`

### Guard clauses

- Guard clauses are written as one-line `if (...) return ...;` without braces, stacked at the top of the function:
  ```ts
  if (!n.length) return "";
  if (n.startsWith("44")) return formatUK(n.slice(2));
  ```
- Module-scope throw guards use the same form: `if (!process.env.API_URL) throw new ReferenceError("...")`
- Combine a `for` loop with a one-line `if` body when filtering: `for (const [k, v] of Object.entries(data)) if (v) ...`

### Local variable naming

- Inside small scopes, very short names are preferred: `n`, `nn`, `cc`, `k`, `v`, `i`, `r`, `e`, `el`
- Outer / exported scope names stay descriptive (`hostname`, `searchParams`, `cookieData`) — the terseness is an inside-the-function thing
- Event-handler parameters are `e`, never `event` or `evt`
- Pre-validation values are prefixed `unsafe` or `raw`: `unsafeData`, `unsafeValue`, `rawName`. The validated counterpart drops the prefix

### Loops and iteration

- Use `for...of` over `.forEach()`
- Use `Array.from(iter).join(...)` over `[...iter].join(...)`
- Use `function*` generators when assembling a sequence with conditional yields

### Comments

- Use short single-line `// ` comments to label sections of a function. Sentence case, ending in a period: `// Stop the page reloading.`, `// Get relevant elements.`
- Group constants under a `// Constants.` label at the top of the file when there are several
- Avoid comments that restate what the code says — comment the *why* or the section purpose
- The trailing-empty-comment trick — `Foo, //` — is used deliberately to force Biome's formatter to keep an argument list multi-line for readability:
  ```ts
  return getClass(
      ELEMENTS_BUTTON_CLASS, //
      getModuleClass(BUTTON_CSS, variants),
  );
  ```
  Preserve these when editing nearby code; don't strip them

### Class private members

- Every `_`-prefixed class member is also marked `private` or `protected` — and vice versa. Never `private foo` without an underscore, never bare `_foo` without an access modifier
- The two travel together as a single signal: "this is internal"
- This applies only to class members. Module-private functions and constants use just the `_` prefix (covered under Code Style → Functions)

### `BLACKHOLE` for intentionally-swallowed promise rejections

- `BLACKHOLE` is exported from `modules/util/function.ts`. Use `.catch(BLACKHOLE)` to mark a promise rejection as deliberately ignored
- Two patterns:
  - `_promise.catch(BLACKHOLE)` — a promise we don't await here but whose error will resurface when something else awaits it. The catch stops the unhandled-rejection warning
  - `await flakyOp().catch(BLACKHOLE)` — a known-flaky operation whose rejection is expected and harmless
- Don't replace with empty `() => {}` or omit the catch. The named symbol documents intent

### `caller: AnyCaller = thisFunction` for attributable errors

- Throw-capable helpers (e.g. `assertArray`, `requireArray`) accept `caller: AnyCaller` as their last parameter, defaulting to the function itself: `caller: AnyCaller = assertArray`
- When the helper throws, the caller chain attributes the error to the user's call site instead of the internal plumbing
- When forwarding to another `caller`-aware helper, pass `caller` through: `assertArray(value, min, max, caller)`
- New helpers that throw `RequiredError` / `AssertionError` should accept this parameter and follow the same default pattern

### Object spreads and merging

- Merge defaults with object spread, defaults first: `{ ...DEFAULTS, ...options }`
- Order of spreads matters and is intentional — don't reorder
- Forward props with rest spread; preserve the existing order

### Verb-prefix vocabulary

The codebase uses a tight, consistent prefix system for function names. Pick the prefix that matches the contract — these are not interchangeable. Extends the prefixes listed under Code Style → Naming with:

| Prefix | Contract | Examples |
|---|---|---|
| `has*` | Boolean predicate (possession, not type) | `hasItems` |
| `to*` | Pure conversion to another shape | `toStringValue` |
| `format*` | Value → display string | `formatNumber`, `formatDate`, `formatUnit` |
| `parse*` | String → structured value (inverse of `format*`) | `parseRequest` |
| `match*` | Result of matching / filtering | `matchQuery`, `matchTemplate` |
| `validate*` | Throws on invalid; returns the validated value | `validateData` |
| `merge*` | Returns a new value combining multiple inputs | `mergeArray`, `mergeObject` |
| `add*` | Returns immutable updated copy with an item added | `addArrayItem`, `addSetItem` |
| `update*` | Returns immutable updated copy with changes applied | `updateData` |
| `await*` | Async counterpart of an otherwise-sync helper | `awaitArray` |
| `run*` | Executes a callback or sequence | `runSequence` |

**Pairing rule:** `get*` and `require*` come as pairs over the same target. `is*` and `assert*` likewise pair. Choosing between them is a contract decision the caller depends on. If you add a new `require*`, consider whether a sibling `get*` belongs alongside it, and similarly for `assert*` / `is*`.

## Testing

- Use `bun:test` and place tests next to the module they cover
- When changing runtime behavior, update or add the closest colocated `*.test.ts`
- When changing TypeScript inference or public generic behavior, include compile-time assignment checks in tests in addition to runtime assertions
- Reuse fixtures and helpers from `modules/test/` when they fit, especially for collection, provider, and query tests
- Test files always import from barrel file (highest possible), so the test also ensures the barrel export

## Documentation

- Every public class, function, and type must have a JSDoc comment. Keep comments updated when behaviour changes — a stale comment is worse than none.
- Classes: one-sentence summary, bullet points for notable behaviour and caveats, `@example` for short inline usage.
- Functions: one-sentence summary, 0–2 behaviour bullets for anything surprising, `@param`/`@returns`/`@throws`, one `@example`.
- When you add, remove, or meaningfully change a class or function, check and update its docblock in the same commit.
- Each module has a `README.md` that acts as a guide page (concepts first, then examples). When module behaviour changes, check whether the README needs updating.
- Trust source and tests over README if they conflict — but fix the README rather than leaving it wrong.
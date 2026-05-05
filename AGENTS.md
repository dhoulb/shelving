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

## Naming

All naming conventions for the codebase are consolidated here. Pick the prefix that matches the contract — these are not interchangeable.

### General

- Prefer single-word names; use `s` suffix for plurals: `item` / `items`, `key` / `keys`
- Module-private functions and constants are prefixed with `_`: `function _helper(...)`, `const _CACHE = ...`. They are not exported
- Prefix unused function arguments with `_` to avoid lint errors: `_event`, `_value`
- Inside small scopes, very short names are preferred: `n`, `nn`, `cc`, `k`, `v`, `i`, `r`, `e`, `el`. Outer / exported scope names stay descriptive (`hostname`, `cookieData`) — the terseness is an inside-the-function thing
- Event-handler parameters are `e`, never `event` or `evt`
- Pre-validation values are prefixed `unsafe` or `raw`: `unsafeData`, `unsafeValue`, `rawName`. The validated counterpart drops the prefix: `const data = validateData(unsafeData)`
- Constants use `UPPER_SNAKE_CASE` only when truly constant (config, schemas, fixed data). Otherwise `camelCase`

### Function prefixes

The codebase uses a tight, consistent prefix system. Pick the one that matches the contract.

| Prefix | Contract | Examples |
|---|---|---|
| `is*` | Boolean type guard returning `value is T` | `isArray`, `isString` |
| `has*` | Boolean predicate (possession / state, not type) | `hasItems` |
| `assert*` | Throws if invalid; uses `asserts value is T` | `assertArray`, `assertString` |
| `validate*` | Throws on invalid; returns the validated value (also strips/coerces) | `validateData` |
| `get*` | Returns value or `undefined` — never throws for "missing" | `getString`, `getData` |
| `require*` | Returns value or throws `RequiredError` | `requireFirst`, `requireString` |
| `with*` | Returns immutable updated copy with a value set | `withProp`, `withArrayItem` |
| `omit*` | Returns immutable updated copy with keys removed | `omitProp`, `omitArrayItem` |
| `add*` | Returns immutable updated copy with an item added | `addArrayItem`, `addSetItem` |
| `update*` | Returns immutable updated copy with changes applied | `updateData` |
| `toggle*` | Returns immutable updated copy with a value toggled | `toggleArrayItem` |
| `merge*` | Returns a new value combining multiple inputs | `mergeArray`, `mergeObject` |
| `to*` | Pure conversion to another shape | `toStringValue` |
| `format*` | Value → display string | `formatNumber`, `formatDate`, `formatUnit` |
| `parse*` | String → structured value (inverse of `format*`) | `parseRequest` |
| `match*` | Result of matching / filtering | `matchQuery`, `matchTemplate` |
| `await*` | Async counterpart of an otherwise-sync helper | `awaitArray` |
| `run*` | Executes a callback or sequence | `runSequence` |

**Pairing rule:** `get*` / `require*` and `is*` / `assert*` come as pairs over the same target. Choosing between them is a contract decision the caller depends on. If you add a new `require*`, consider whether a sibling `get*` belongs alongside it; same for `assert*` / `is*`.

### Reserved prefixes (UI / event layer)

These prefixes are reserved for the upcoming UI / component layer. Don't repurpose them for unrelated helpers.

| Prefix | Contract | Examples |
|---|---|---|
| `notify*` | Dispatches a notice / `notice` CustomEvent | `notify`, `notifySuccess`, `notifyError`, `notifyThrown` |
| `call*` | Runs a callback, dispatches notices on its return / throw | `callNotified`, `callNotifiedForm` |
| `handle*` | Top-level request / event entry point | `handleAPI`, `handleEndpoints` |
| `on*` | Event-handler **prop** name on a component (not a function name) | `onClick`, `onValue`, `onSubmit` |

## Imports & Exports

- Always use `.js` extension in import paths: `import { x } from "./x.js"`
- Named exports only — no default exports (CSS modules excepted, see React Components)
- Barrel files (`index.ts`) re-export with `export * from "./X.js"`, alphabetically sorted
- Keep barrel exports in sync when moving or adding files
- Never import from barrel files within the same package
- `verbatimModuleSyntax` is on — `import type { ... }` is mandatory for type-only imports. Inline `type` in mixed imports: `import { type Foo, bar }`

## Types

- `readonly` on properties and arrays by default
- Type guards use `value is T` return type
- Assertion functions use `asserts value is T` return type
- `exactOptionalPropertyTypes` is on — use `| undefined` explicitly in optional property types
- Prefer `type` aliases over `interface` for simple shapes. Use `interface` when extending or representing a props / options object
- Use union types for discriminated unions
- Generic constraints use the named types from `shelving` (`Data`, `Arguments`, etc.), not raw `Record<string, unknown>`
- Props interfaces use a `*Props` suffix; no `I` prefix on interfaces

## Functions

- Regular `function` declarations for public API exports
- Arrow functions for short utilities, callbacks, and one-liners
- File-local helper functions are commonly prefixed with `_` (see Naming)
- Public exports usually have short JSDoc comments; keep them updated when changing behaviour
- Default parameter values used heavily in destructured props: `{ required = false, disabled = false }`
- Prefer early returns and guard clauses over deeply nested conditionals
- Prefer existing helpers like `withProp`, `withProps`, `omitProps`, `updateData`, `getFilters`, `getOrders`, `getUpdates`, and `validateData` over open-coded object/query/update logic
- Many immutable helpers intentionally return the original reference when nothing changed. Preserve that behaviour where possible instead of always cloning

### `caller: AnyCaller = thisFunction` for attributable errors

Throw-capable helpers (e.g. `assertArray`, `requireArray`) accept `caller: AnyCaller` as their last parameter, defaulting to the function itself.

- Default value is the function itself: `caller: AnyCaller = assertArray`
- When the helper throws, the caller chain attributes the error to the user's call site instead of the internal plumbing
- When forwarding to another `caller`-aware helper, pass `caller` through: `assertArray(value, min, max, caller)`
- New helpers that throw `RequiredError` / `AssertionError` should accept this parameter and follow the same default pattern

## Classes

- Every `_`-prefixed class member is also marked `private` or `protected` — and vice versa. Never `private foo` without an underscore, never bare `_foo` without an access modifier
- The two travel together as a single signal: "this is internal"
- This applies only to class members. Module-private functions and constants use just the `_` prefix (see Naming)

## Variables

### Destructuring

- Always destructure when reading 2+ properties from the same object: `const { method, url } = request`, not `request.method` and `request.url` separately
- Destructure even single properties when the source name is long: `const { requireSource } = require...()`
- Rename on destructure with `:` to disambiguate or to mark validation state: `const { data: unsafeData } = ...`
- Function parameters destructure inline in the signature, including renames: `function foo({ key, data: unsafeData }: Args) { ... }`
- Methods on a class destructure `this`: `const { state, props } = this`

### Coercion

- Use `.toString()` on values, not `String(value)`
- Use `Number.parseInt` / `Number.parseFloat` over the global `Number(...)`; only use `Number(...)` when no method-form alternative exists
- Use `!!x` for boolean coercion
- Use `Number.POSITIVE_INFINITY` not `Infinity`, `Number.isFinite()` not the global `isFinite()` (Biome's `useNumberNamespace`)

### Truthy and nullish

- Prefer truthy checks over explicit `=== undefined` / `=== null` / `=== ""`: write `if (!value) return ...`, not `if (value === undefined || value === "")`
- Use `||` (not `??`) when empty string and zero should also fall through to the default — this is the common case
- Reserve `??` for narrow null / undefined defaults, especially `process.env.X ?? ""`
- Use optional chaining + truthiness liberally: `if (items?.length) ...`

### Object spreads

- Merge defaults with object spread, defaults first: `{ ...DEFAULTS, ...options }`
- Order of spreads matters and is intentional — don't reorder
- Forward props with rest spread; preserve the existing order

## Control Flow

### Guard clauses

Guard clauses are written as one-line `if (...) return ...;` without braces, stacked at the top of the function:

```ts
if (!n.length) return "";
if (n.startsWith("44")) return formatUK(n.slice(2));
```

- Module-scope throw guards use the same form: `if (!process.env.API_URL) throw new ReferenceError("...")`
- Combine a `for` loop with a one-line `if` body when filtering: `for (const [k, v] of Object.entries(data)) if (v) ...`

### Loops

- Use `for...of` over `.forEach()`
- Use `Array.from(iter).join(...)` over `[...iter].join(...)`
- Use `function*` generators when assembling a sequence with conditional yields

### Comments

- Use short single-line `//` comments to label sections of a function. Sentence case, ending in a period: `// Stop the page reloading.`, `// Get relevant elements.`
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

## Async Patterns

### `BLACKHOLE` for intentionally-swallowed promise rejections

`BLACKHOLE` is exported from `modules/util/function.ts`. Use `.catch(BLACKHOLE)` to mark a promise rejection as deliberately ignored.

Two patterns:

- `_promise.catch(BLACKHOLE)` — a promise we don't await here but whose error will resurface when something else awaits it. The catch stops the unhandled-rejection warning
- `await flakyOp().catch(BLACKHOLE)` — a known-flaky operation whose rejection is expected and harmless

Don't replace with empty `() => {}` or omit the catch. The named symbol documents intent.

## Schemas, Queries, and Updates

- Schema classes usually export both the class and ready-made constants or factories, for example `StringSchema` plus `STRING`, or `DataSchema` plus `DATA` / `PARTIAL` / `ITEM`
- Schema defaults and coercions are part of the intended behaviour. Before changing them, check the colocated tests for the current contract
- Query and update APIs use encoded key syntax like `$order`, `$limit`, `!key`, `key[]`, `key>`, `=key`, `+=key`, and `+[]key`. Extend these via shared helpers rather than bespoke parsing in each provider
- Collections are defined with `Collection` / `COLLECTION` from a collection name, an id schema, and a data schema. Provider code should operate in terms of `Collection`, not loose strings plus ad-hoc validators

## Error Handling

- Schema validation errors throw a `string` (human-readable message like `"name: Must be 5-50 characters"`). Let these propagate as-is when they represent user input errors — form handlers and UI layers consume these strings directly
- Only wrap validation strings in a typed error (e.g. `ResponseError`, `ValueError`) when the error is a system / transport problem rather than a user input problem. For example, a bad API response body is a server error (`ResponseError` code 422), not a user error
- Aggregated validation failures use `"key: message"` lines joined by `\n`. Preserve that format for multi-field and nested validation errors
- `validateData()` strips excess keys and removes `undefined` outputs. Keep that behaviour unless you are intentionally changing the validation contract
- The pattern `const message = getMessage(thrown); if (!message) throw thrown;` re-throws non-string errors while handling string messages gracefully

## Providers, Stores, and React

- DB and API providers are layered wrappers. Prefer extending existing provider chains such as `Through*Provider`, `Validation*Provider`, and `Cache*Provider` patterns instead of duplicating logic
- Wrapped providers are discovered through `source` and helpers like `getSource()` / `requireSource()`, not by reaching into private internals
- `Store.value` intentionally supports suspense-like reads: it can throw a `Promise` while loading or throw `reason` on failure. Do not simplify this into nullable return values
- Store implementations suppress duplicate emissions when values are equal and use the `NONE` sentinel for loading state. Preserve those semantics in new store types
- React context helpers return both a provider component and typed hooks, for example `createDataContext()` and `createCacheContext()`. Follow that pattern for new React integrations

## React Components

Conventions for the upcoming reusable component layer.

### File and naming

- Component files are named after the component they export: `Button.tsx` exports `Button`, `FormStore.tsx` exports `FormStore`
- CSS modules are named to match their component: `Button.module.css` for `Button.tsx`
- Layout components: `*Layout` suffix (e.g. `DashboardLayout`) — provide structural layout for a page
- Page components: `*Page` suffix (e.g. `SettingsPage`) — top-level router entries that compose existing components; they should not need custom-styled elements
- Reusable components live in a shared component library and expose styling options as **variants**

### Component patterns

- Components are plain named function declarations, not arrow functions: `export function Button(...): ReactElement { }`
- Return type is `ReactElement`, not `JSX.Element`
- Props are destructured in the function signature with defaults
- The `{ children, ...variants }` destructuring pattern separates content from styling variants, which are passed as a dictionary to `getModuleClass(styles, variants)`
- Conditional rendering uses `&&` and ternary operators inline in JSX — not separate variables or early returns for JSX fragments
- Inline arrow handlers in JSX are the default — even multi-line ones
- Hoist a handler to a `function _name(...)` only when it's pure, doesn't close over state, and is reused
- Components that wrap clickable elements delegate to `getClickable()` which returns `<a>` or `<button>` based on `href` vs `onClick`

### CSS Modules and variants

- Never use inline `style` props — all styling lives in a `.module.css` file colocated with the component
- Variants are boolean props on the component (`small`, `primary`, `plain`, `column`, etc.) that map to class names in the CSS module via `getModuleClass(styles, "base", variants)`
- If a problem can be solved by adding a variant to an existing component, prefer that
- If a reusable component is missing that would belong in a standard component library, add it
- CSS custom properties (variables) are used for theming with fallback chains: `var(--button-color-bg, var(--color-surface))`
- CSS nesting is used for variants (`&.small { ... }`), pseudo-classes (`&:hover { ... }`), and child selectors (`:where(& > *) { ... }`)
- `:where()` is used to keep specificity low for default child styles
- CSS modules are imported as default: `import styles from "./Foo.module.css"`, or with a `_CSS` suffix for named-export style: `import BUTTON_CSS from "./Button.module.css"`. CSS modules are the one exception to the named-exports-only rule

### Copy

- Titles, headings, and button labels use sentence case — only the first word capitalised, plus proper nouns. E.g. "Change details", not "Change Details"

## Testing

- Use `bun:test` and place tests next to the module they cover
- When changing runtime behaviour, update or add the closest colocated `*.test.ts`
- When changing TypeScript inference or public generic behaviour, include compile-time assignment checks in tests in addition to runtime assertions
- Reuse fixtures and helpers from `modules/test/` when they fit, especially for collection, provider, and query tests
- Test files always import from the highest possible barrel file, so the test also ensures the barrel export
- Test descriptions are lowercase sentence fragments: `test("formats from leading 0", ...)`
- Use `expect.unreachable()` to assert that a code path should not be reached (in catch blocks testing thrown errors)

## Documentation

- Every public class, function, and type must have a JSDoc comment. Keep comments updated when behaviour changes — a stale comment is worse than none
- Classes: one-sentence summary, bullet points for notable behaviour and caveats, `@example` for short inline usage
- Functions: one-sentence summary, 0–2 behaviour bullets for anything surprising, `@param` / `@returns` / `@throws`, one `@example`
- When you add, remove, or meaningfully change a class or function, check and update its docblock in the same commit
- Each module has a `README.md` that acts as a guide page (concepts first, then examples). When module behaviour changes, check whether the README needs updating
- Trust source and tests over README if they conflict — but fix the README rather than leaving it wrong

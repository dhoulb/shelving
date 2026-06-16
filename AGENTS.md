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

## Project Tasks

Outstanding todos, known gaps, and deferred decisions are tracked as **GitHub issues** on the [`dhoulb/shelving`](https://github.com/dhoulb/shelving/issues) repository. There is no in-repo task list — this replaces the former `PROJECT.md`.

- Each issue is labelled with the module folder name(s) it relates to — `util`, `markup`, `ui`, `db`, `api`, `extract`, `bun`, `test`, etc.
- When a PR resolves an issue, link it with a `Closes #123` / `Fixes #123` keyword so it closes automatically on merge — see the [Pull Requests](#pull-requests) section.
- When a new gap or deferred decision is found, open a new issue and apply the relevant module label(s).

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

## Reuse and Composition

Before writing new code, find what already exists. The codebase deliberately exposes shared primitives — components, utility functions, types, classes — and most new work should compose them rather than reinvent.

- **Scan first.** Before writing a new component, utility, or type, check the relevant module(s) for something that already does the job — exactly, or closely enough that a parameter or variant would cover the difference. AI agents tend to write fresh code when an existing helper would do; the explicit pre-write check is the cure
- **Compose, don't restyle.** A "complex" component bound to a content type (e.g. a `*Page` or `*Card` for a specific kind of content) should rarely ship its own CSS module. It picks up its visual identity from existing library components (`Card`, `Page`, `Button`, `Tag`, `Notice`, etc.). A small handful of genuinely custom small components per app may legitimately need their own styling; everything else reuses
- **Propose, don't silently modify.** If an existing component, utility, or type is missing a needed capability — a prop, a variant, a parameter, a return-shape tweak — stop and propose the targeted change. Wait for input on how it should be designed. Never silently extend existing code in this project; modifications to existing modules require explicit discussion every time
- **Propose, don't invent.** If nothing in the library covers a need, propose the new component/utility/type and how it would slot in. Wait for input before building it. Don't add new shared primitives unannounced

## Commits

- Use [Conventional Commits](https://www.conventionalcommits.org/) format for all commit messages, for example: `feat: add cache provider` or `fix: handle undefined schema value`
- Commit types feed semantic-release versioning
- `feat:` triggers a minor release
- `fix:` triggers a patch release
- While the project is still on `v0`, do not use `BREAKING CHANGE:` footers or `!` commit markers to trigger a major release
- If a change is breaking in practice, describe it clearly in the commit body or PR, but keep the commit type within the non-major release flow for now

## Pull Requests

- Every PR that resolves a tracked issue **must** link it in the PR description with a [closing keyword](https://docs.github.com/articles/closing-issues-using-keywords) — `Closes #123` / `Fixes #123` — so GitHub closes the issue automatically when the PR merges. List every issue the PR resolves, one keyword each. This is mandatory: never rely on closing issues by hand after merge.
- **Open a PR proactively** once a change is in a reviewable state — don't wait to be asked. This is the normal way work is shared here, and it's especially important for **documentation-site changes**: the `docs.yaml` workflow builds a live preview for every PR at `https://dhoulb.github.io/shelving/pr-<number>/` (and comments the link on the PR), which is the only way to eyeball the rendered docs. Any change touching `modules/ui/**`, `modules/extract/**`, `modules/markup/**`, the per-symbol `.md` pages, or docblocks should go up as a PR so the preview is generated.

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
| `get*` | Returns value or `undefined` — never throws for "missing"; may return input unchanged when already valid | `getString`, `getData` |
| `require*` | Returns value or throws `RequiredError` | `requireFirst`, `requireString` |
| `create*` | Always returns a freshly constructed instance — never returns the input unchanged and never returns `undefined` | `createDeferred`, `createMarkupRule`, `createJSONRequest` |
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

**`get*` vs `create*`:** if a helper unconditionally constructs and returns a brand-new instance (e.g. always calls `new X(...)` or always returns a fresh object literal), name it `create*`. Reserve `get*` for "look up, coerce, or normalise" — helpers that may return the input unchanged when it's already valid, or return `undefined` when there's nothing to return. Most factories the codebase needs are written inline as `new X(...)`; the `create*` prefix is for the few cases where a helper wraps construction (typing, defaulting, composing).

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
- In source files, always import from the declaration file directly (e.g. `../../util/array.js`), never from a barrel
- In test files, always import from the highest applicable barrel (e.g. `shelving/util` not `../../util/array.js`) — this verifies the barrel export exists
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
- Every reusable component carries a `@kind component` tag in its docblock so the docs extractor labels it as a `component` rather than a `function` (it's grouped and colour-coded separately on the docs site). See the Documentation section. Helper functions that happen to live in a component file (e.g. `getButtonClass`) stay plain functions — no `@kind`

### CSS Modules and variants

- Never use inline `style` props — all styling lives in a `.module.css` file colocated with the component
- Styling options are props on the component. Mutually-exclusive scales are enumerated props (`color="red"`, `size="large"`, `space="none"`, `padding`, `gap`, `tint`, `status`) defined in `modules/ui/style/`; on/off options are boolean props (`small`, `strong`, `plain`, `column`, `wrap`, `narrow`). Both map to class names in the CSS module via the `getXxxClass(props)` helpers and `getModuleClass(styles, "base", variants)`
- CSS custom properties (variables) are used for theming with fallback chains: `var(--button-background, var(--tint-90))`
- CSS nesting is used for variants (`&.small { ... }`), pseudo-classes (`&:hover { ... }`), and child selectors (`:where(& > *) { ... }`)
- `:where()` is used to keep specificity low for default child styles
- CSS modules are imported as default: `import styles from "./Foo.module.css"`, or with a `_CSS` suffix for named-export style: `import BUTTON_CSS from "./Button.module.css"`. CSS modules are the one exception to the named-exports-only rule
- **CSS custom property naming.** Variables owned by a specific module file (theme hooks consumers can set, internal runtime variables the module writes and reads) must start with the file's kebab-case name. So `Card.module.css` owns `--card-tint`, `--card-background`, `--card-padding`, `--card-radius`; `Flex.module.css` owns `--flex-gap`, `--flex-icon-size`. This makes the originating file obvious from any `var(--...)` reference. Exempt: design-token constants declared at `:root` in `style/base.css` (`--color-*` / `--space-*` / `--size-*` etc.) and the tint ladder (`--tint-00` … `--tint-100`) computed in `style/Tint.module.css`.
- **One tint anchor, then per-property hooks.** A painted component rebinds the ladder anchor once at the top of its rule (`--tint-50: var(--card-tint, inherit);`) and paints every property from a ladder step with a per-property hook in front (`background: var(--card-background, var(--tint-90))`). Do **not** reintroduce a per-component five-step colour scheme (`--card-color-black` / `-dark` / `-vivid` / `-light` / `-white` and the matching `*-color-bg` / `*-color-border` / `*-color-text` hooks). That scheme was tried and removed in favour of the single-anchor model; older issue comments describing it are stale. The tint ladder and the rebind pattern are documented on the `TINT_CLASS` page (`modules/ui/style/TINT_CLASS.md`) — keep that the source of truth.

### Writing a new component

A typical new block-level component looks like:

```tsx
// Address.tsx
import { type ColorProps, getColorClass } from "../style/Color.js";
import { getSpacingClass, type SpacingProps } from "../style/Spacing.js";
import { getTypographyClass, type TypographyProps } from "../style/Typography.js";

export interface AddressProps extends ColorProps, SpacingProps, TypographyProps, ChildProps {}

export function Address({ children, ...props }: AddressProps) {
  return (
    <address
      className={getClass(
        getModuleClass(styles, "address"),
        getColorClass(props),
        getSpacingClass(props),
        getTypographyClass(props),
      )}
    >
      {children}
    </address>
  );
}
```

```css
/* Address.module.css */
@import "../style/base.css";

@layer components {
  .address {
    /* Theme — rebind the tint anchor so `--address-tint` (and parent scopes) flow through. */
    --tint-50: var(--address-tint, inherit);

    /* Box */
    display: block;
    margin-inline: 0;
    margin-block: var(--address-space, var(--space-paragraph));

    /* Text — paint from the ladder, with a per-property hook in front. */
    color: var(--address-color, var(--tint-00));
    font-family: var(--address-font, inherit);
    font-size: var(--address-size, inherit);
  }
}

@layer overrides {
  .address {
    &:first-child { margin-block-start: 0; }
    &:last-child { margin-block-end: 0; }
  }
}
```

The `:first-child` / `:last-child` margin overrides live in a separate `@layer overrides` block because they must beat variant-set margins: every paragraph-level component zeros its outer margins at the top or bottom of its container, so a `Heading` at the top of a `Card` doesn't leave a strip of unwanted space. `@layer overrides` beats every other layer, so a `<Paragraph space="large">` still collapses its abutting edges correctly.

Checklist:

- [ ] `@import "../style/base.css";` at the top of the `.module.css`.
- [ ] All component rules inside `@layer components { … }`.
- [ ] All custom properties owned by this file start with the file name (`--address-*`, etc.) — see the CSS custom property naming rule above.
- [ ] If the component paints colour, rebind the tint anchor at the top of the rule (`--tint-50: var(--address-tint, inherit);`) and paint from ladder steps with per-property hooks in front.
- [ ] `:first-child` / `:last-child` overrides in a separate `@layer overrides { … }` block.
- [ ] TSX extends the styling-prop interfaces (`ColorProps`, `SpacingProps`, `TypographyProps`, etc.) you want to expose and composes the matching `getXxxClass(props)` calls.
- [ ] `@kind component` in the docblock, and a sibling `Address.md` with usage examples and a Styling section (see the Documentation section).

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
- Each module has a `README.md` that acts as the module's guide page. It covers **purpose, key concepts, and integration examples** — how to combine the module's classes and functions to accomplish real tasks (and, for families like `error`, shared traits). When module behaviour changes, check whether the README needs updating
- **Per-class / per-function usage examples** live in a sibling `MyClass.md` / `myFunction.md` next to the source file. `DirectoryExtractor` merges that markdown onto the symbol's own page (`MarkupExtractor` outranks `TypescriptExtractor`), so detailed usage belongs there rather than in the module README. `modules/util/template.md` is the precedent. This applies to UI components too — each reusable component gets a sibling `.md` (`Card.md` next to `Card.tsx`) with usage examples and a **Styling** section (see below)
- Trust source and tests over README if they conflict — but fix the README rather than leaving it wrong

### Cross-references and token display

Whenever a README, per-symbol `.md` page, or docblock names another module or token — a class, function, constant, type, method, property, or component — link it to its canonical docs-site page. Use a backtick-quoted name as the link text and a site-root-relative path as the target:

```
[`BooleanSchema`](/schema/BooleanSchema)
```

i.e. ``[`nameOfToken`](/canonical/path)``. This is mandatory for **"See also" lists** and for **inline references** to classes / functions / methods / properties / components alike — not just link lists. Link the first mention in a passage; don't re-link the same token on every line.

**Canonical paths** mirror the docs-site router (the path the page actually resolves at — note this is *not* the same as the longer `@see` page URL):

- A top-level module is `/<module>` — `/schema`, `/db`, `/store`, `/ui`.
- A token is `/<module>/<Token>` — `/schema/BooleanSchema`, `/db/Collection`, `/store/Store`.
- A member is `/<module>/<Token>/<member>` — `/schema/BooleanSchema/validate`, `/store/Store/value`.
- The `util` module is published per-file, so its tokens are `/util/<file>/<Token>` — `/util/array/getArray`, `/util/format/formatDate`, `/util/object/withProp`.

**Only link to paths that resolve to a real page.** The docs tree is flat per top-level module: there are no submodule pages (`/db/collection`, `/api/provider`, `/markup/rule`, `/ui/tree`), and no bare `/firestore` or `/util` page. Link a submodule or module concept to its nearest real page instead — `/db`, `/api`, `/markup`, `/firestore/client`, or the specific `/util/<file>`.

**Token display style.** Format a token name so its kind reads from the text, then put the styled name inside the link:

| Kind | Style | Example |
|---|---|---|
| Function | trailing parens | `formatDate()` |
| Method | leading dot + trailing parens | `.validate()` |
| Property | leading dot | `.value` |
| Component | angle brackets | `<Section>` |
| Class / interface / type / constant | bare name | `BooleanSchema`, `STRING` |

So a linked reference reads ``[`<Section>`](/ui/Section)``, ``[`formatDate()`](/util/format/formatDate)``, ``[`.validate()`](/schema/BooleanSchema/validate)``, or ``[`.value`](/store/Store/value)``. Apply the same styling to unlinked mentions (e.g. a builtin or external symbol with no page) so the kind is still obvious.

**Generics belong in the link text.** When a token is referenced with its generic parameters, keep the whole thing inside one backtick-quoted link — ``[`Schema<T>`](/schema/Schema)``, ``[`ItemStore<I, T>`](/db/ItemStore)`` — not the bare name linked with the generics trailing in a second code span (``[`Schema`](/schema/Schema)`<T>``), which renders as two separate, awkwardly-split chips. The path still targets the bare token; only the displayed name carries the generics.

**Member access belongs in the link text too.** A qualified reference like `PostgreSQLMigrator.migrate()` is a single link whose text holds the whole chain — ``[`PostgreSQLMigrator.migrate()`](/db/PostgreSQLMigrator)`` — not a class link with the `.method()` trailing in a second span. Target the **class** page in most cases (the member often has no page of its own); only link the member page directly when the reference is to the bare member (``[`.validate()`](/schema/BooleanSchema/validate)``). Never split one styled reference across two adjacent code spans.

### UI component pages and CSS-variable documentation

Each reusable UI component's sibling `.md` (e.g. `modules/ui/block/Card.md`) follows the same shape as other per-symbol pages — a `# Name` heading, a short purpose paragraph, a "Things to know" bullet list, runnable `tsx` usage examples — plus a **Styling** section that documents the component's themeable surface. The CSS custom properties are written inline in the `.module.css` (`var(--card-background, …)`), so there's no declaration site for an extractor to read; the Styling table is the documented source of truth and must be kept in sync by hand.

A Styling section has two parts:

- A **table of the component's own hooks** — three columns: `Variable` | `Styles` | `Default`. List every `--component-*` custom property the `.module.css` reads, what painted property it controls, and its fallback value (resolve token references to a human-readable note, e.g. `var(--radius-normal)` (16px)).
- A **list of the global tokens** the component reads (tint-ladder steps and `--space-*` / `--radius-*` / `--color-*` / etc.), so a theme writer knows which broad levers also move it.

A component that exposes no own hooks and only inherits says so explicitly in one line rather than omitting the section. **When a component's `.module.css` gains, loses, or renames a `--variable`, update its `.md` Styling table in the same commit** — same rule as keeping a docblock in step with behaviour. `modules/ui/block/Card.md` is the precedent.

### `@kind` docblock override

The TypeScript extractor infers a symbol's `kind` from its declaration (`function`, `class`, `interface`, `type`, `constant`). A `@kind <name>` tag in the docblock overrides that. Its primary use is `@kind component` on every reusable React component so the docs site groups and colours components separately from plain functions. The tag is consumed by the extractor (it does not appear in the rendered page body), and a non-`function` kind renders the title as a bare name (`Card`, not `Card()`). New documented kinds need a colour in `DocumentationKind` and a section in `DocumentationPage`'s `KIND_SECTIONS`.

### Sugar instances and factories

For convenience the `schema` module ships **sugar** — pre-built shortcuts that improve the readability of code that creates schemas. There are two kinds, named consistently:

- A **sugar instance** is a pre-instantiated copy of a `Schema` class exported as an `ALL_CAPS` constant — e.g. `STRING` is `new StringSchema({})`, `REQUIRED_STRING` is `new StringSchema({ min: 1 })`.
- A **sugar factory** is a `function` whose purpose is to call `new SomeClass(...)` with sensible defaults — e.g. `DATA` builds a `DataSchema`, `NULLABLE` a `NullableSchema`.

**Sugar instances.** Open the docblock with one line that states the class it instantiates (as a docs-site markdown link) and the equivalent constructor call, since that first line becomes the card `description`:

  ```ts
  /**
   * Sugar instance of [`StringSchema`](/schema/StringSchema) for an unconstrained string. Equivalent to `new StringSchema({})`.
   *
   * @example STRING.validate(123); // Returns "123"
   * @see https://dhoulb.github.io/shelving/schema/StringSchema/STRING
   */
  export const STRING = new StringSchema({});
  ```

  When the instance is built by composing a sugar factory rather than `new` (e.g. `NULLABLE_TITLE = NULLABLE(TITLE)`), name the equivalent factory call instead: `` Equivalent to `NULLABLE(TITLE)`. ``, and link the wrapped sugar instance (`` [`TITLE`](/schema/TITLE) ``).

**Sugar factories.** Write them as regular `function` declarations, not arrow-consts. A `function` declaration classifies as `kind: "function"` on the docs site (an arrow-const wrongly shows as a `constant`), gives a named stack trace, and is the preferred form for public-API exports anyway (see the Functions section). Mark a factory in its docblock with a short line naming the class it builds, on its own paragraph after the summary:

  ```ts
  /**
   * Create a `DataSchema` for a set of properties.
   *
   * Sugar factory for [`DataSchema`](/schema/DataSchema).
   */
  export function DATA<T extends Data>(props: Schemas<T>): DataSchema<T> {
  	return new DataSchema({ props });
  }
  ```

- The canonical wording is exactly `Sugar factory for [\`ClassName\`](/schema/ClassName).` — plain text (no `*asterisks*` or `_underscores_`; the `markup` renderer would make those bold or italic respectively), with a backtick-quoted class name linked to its docs page. When a factory composes other factories (e.g. `NULLABLE_DATA` wraps a `DataSchema` in a `NullableSchema`), name the class it ultimately returns

### Docblock standards

Every public token now ships as a page on the docs site, so docblock quality directly determines docs quality. Hold every class, function, method, interface, type, and constant to this standard, and match the voice and rigour of the existing well-written docblocks (terse, declarative, backtick-quoted type names, bullet caveats) rather than inventing a new style.

- **Strong first line (becomes the `description`).** Open with one short, clear line stating the token's purpose — what it's for and how it relates to the rest of the module. The extractor lifts this first paragraph as the `description` shown on cards and `<meta>` tags, so it must stand alone. Imperative or declarative voice, no hedging. Put further detail — behaviour, caveats, gotchas — on later lines or bullets.
- **`@example`.** Every **class**, **function**, and **method** gets at least one `@example` unless it's genuinely micro / self-evident (e.g. a one-line type guard). Show the shortest call site that conveys real usage. **Properties** don't need examples.
- **`@param` / `@returns` / `@throws`.** Document parameters, return value, and thrown errors on every class constructor, method, and standalone function. These feed the docs site's Parameters / Returns / Throws sections. (Schema validation throws a `string` message — document those with `@throws` too.)
- **`@see` docs-site link.** Every token published on the docs site gets a `@see` block tag pointing at its page, so VS Code hover reveals a clickable link. Prefer the `@see` block tag over inline `{@link}` — it renders better in the hover popup. The URL pattern mirrors the docs-site routing:

  ```
  @see https://dhoulb.github.io/shelving/<path>/<name>
  ```

  where `<path>` is the source file's path relative to `modules/` with the extension dropped, and `<name>` is the exported symbol. So `modules/schema/BooleanSchema.ts`'s `BooleanSchema` class → `https://dhoulb.github.io/shelving/schema/BooleanSchema/BooleanSchema`; `modules/util/array.ts`'s `getArray` → `https://dhoulb.github.io/shelving/util/array/getArray`; a class member appends its own name → `.../schema/BooleanSchema/BooleanSchema/validate`.

Example shape:

```ts
/**
 * Get the first item of an array, or `undefined` if it's empty.
 *
 * @param arr The array to read from.
 * @returns The first item, or `undefined` when the array is empty.
 * @example getArray(["a", "b"]) // "a"
 * @see https://dhoulb.github.io/shelving/util/array/getArray
 */
```

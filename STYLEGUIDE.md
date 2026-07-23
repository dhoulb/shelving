# Code styleguide

A portable styleguide distilled from the `shelving` codebase and its `AGENTS.md`. Follow it when starting a new TypeScript project in this style. Rules are stated as requirements — deviate only with a stated reason.

## Philosophy

- **Reuse before writing.** Before writing a new function, component, or type, scan the codebase for something that already does the job — exactly, or closely enough that a parameter or variant covers the difference. Compose existing primitives rather than reinvent.
- **Immutability by default.** Data in, new data out. Helpers that "change" a value return an updated copy — and intentionally return the *original reference* when nothing changed, so equality checks stay cheap.
- **Contracts in names.** A function's prefix (`get*`, `require*`, `assert*`, `create*`, …) is a promise about its behaviour. Callers depend on it, so pick the prefix that matches the contract exactly.
- **Terse inside, descriptive outside.** Exported names are clear and descriptive; inside a small function body, very short names are preferred.

## Tooling

- **Biome** for linting and formatting; **TypeScript** in strict mode; **Bun** as the test runner.
- Formatting: **tabs** for indentation, **line width 140**, `arrowParentheses: "asNeeded"`.
- Notable lint rules (treat as law even without Biome):
  - No non-null assertions (`!`) in source code (allowed in tests).
  - No namespace imports (`import * as`), no default exports, no unused imports.
  - No floating promises — every promise is awaited, returned, or explicitly `.catch`-ed.
  - `console.log` is banned; `console.debug` / `console.warn` / `console.error` are allowed.
  - No empty blocks; no skipped tests.
- TypeScript compiler options to enable: `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `verbatimModuleSyntax`, `isolatedModules`, `module: "nodenext"`, `target: "esnext"`.

## Project structure

- One source root (e.g. `modules/`) containing one folder per module; generated output (`dist/`) is never edited by hand.
- Tests are **colocated** with source as `*.test.ts`.
- File naming: utility files are lowercase (`util/object.ts`); class and schema files are PascalCase and named after their main export (`schema/StringSchema.ts`). React files use `.tsx` only when they contain JSX.
- Each module has a barrel `index.ts` that re-exports with `export * from "./X.js"`, alphabetically sorted. Keep barrels in sync when adding or moving files.

## Naming

### General

- Prefer single-word names; plurals take an `s` suffix: `item` / `items`, `key` / `keys`.
- Module-private (non-exported) functions and constants are prefixed with `_`: `function _helper(...)`, `const _CACHE = ...`.
- Prefix unused function arguments with `_`: `_event`, `_value`.
- Inside small scopes, very short names are preferred: `n`, `nn`, `k`, `v`, `i`, `r`, `e`, `el`. Exported / outer-scope names stay descriptive (`hostname`, `cookieData`).
- Event-handler parameters are `e` — never `event` or `evt`.
- Pre-validation values are prefixed `unsafe` or `raw` (`unsafeData`, `rawName`); the validated counterpart drops the prefix: `const data = validateData(unsafeData)`.
- `UPPER_SNAKE_CASE` only for truly constant values (config, schemas, fixed data); otherwise `camelCase`.

### Function prefixes

Pick the prefix that matches the contract — they are not interchangeable.

| Prefix | Contract | Examples |
|---|---|---|
| `is*` | Boolean type guard returning `value is T` | `isArray`, `isString` |
| `has*` | Boolean predicate (possession / state, not type) | `hasItems` |
| `assert*` | Throws if invalid; uses `asserts value is T` | `assertArray` |
| `validate*` | Throws on invalid; returns the validated value (also strips/coerces) | `validateData` |
| `get*` | Returns value or `undefined` — never throws for "missing"; may return input unchanged when already valid | `getString` |
| `require*` | Returns value or throws | `requireFirst` |
| `create*` | Always returns a freshly constructed instance — never returns the input, never `undefined` | `createDeferred` |
| `with*` | Immutable updated copy with a value set | `withProp` |
| `omit*` | Immutable updated copy with keys removed | `omitProp` |
| `add*` | Immutable updated copy with an item added | `addArrayItem` |
| `update*` | Immutable updated copy with changes applied | `updateData` |
| `toggle*` | Immutable updated copy with a value toggled | `toggleArrayItem` |
| `merge*` | New value combining multiple inputs | `mergeObject` |
| `to*` | Pure conversion to another shape | `toStringValue` |
| `format*` | Value → display string | `formatDate` |
| `parse*` | String → structured value (inverse of `format*`) | `parseRequest` |
| `match*` | Result of matching / filtering | `matchQuery` |
| `await*` | Async counterpart of an otherwise-sync helper | `awaitArray` |
| `run*` | Executes a callback or sequence | `runSequence` |

- **Pairing rule:** `get*` / `require*` and `is*` / `assert*` come as pairs over the same target. If you add a new `require*`, consider whether a sibling `get*` belongs alongside it; same for `assert*` / `is*`.
- **`get*` vs `create*`:** a helper that unconditionally constructs a brand-new instance is `create*`. Reserve `get*` for "look up, coerce, or normalise" — helpers that may return the input unchanged or return `undefined`. Most construction is written inline as `new X(...)`; `create*` is for the few helpers that wrap construction.

### UI / event-layer prefixes

Reserved for the UI layer — don't repurpose them for unrelated helpers:

| Prefix | Contract |
|---|---|
| `notify*` | Dispatches a notice / custom event |
| `call*` | Runs a callback, dispatching notices on return / throw |
| `handle*` | Top-level request / event entry point |
| `on*` | Event-handler **prop** name on a component (not a function name) |

## Imports & exports

- Always use the `.js` extension in import paths: `import { x } from "./x.js"`.
- **Named exports only** — no default exports. (CSS modules are the one exception.)
- In source files, import from the declaration file directly (`../util/array.js`), never from a barrel.
- In test files, import from the package's public barrel (`mypackage/util/array`), never a relative source path — this verifies the barrel actually re-exports the token. Wire package-name → source resolution via `tsconfig.json` `paths`, and enforce with a lint rule (Biome `noRestrictedImports`) if possible.
- `import type { ... }` is mandatory for type-only imports (`verbatimModuleSyntax`). Inline `type` in mixed imports: `import { type Foo, bar }`.

## Types

- `readonly` on properties and arrays by default (`readonly x: string`, `readonly T[]`).
- Type guards return `value is T`; assertion functions return `asserts value is T`.
- With `exactOptionalPropertyTypes` on, optional properties are written `readonly x?: string | undefined`.
- Prefer `type` aliases for simple shapes; use `interface` when extending or when representing a props / options object.
- Discriminated unions over class hierarchies for variant data.
- Props interfaces use a `*Props` suffix; options interfaces use `*Options`; no `I` prefix.
- Prefer named domain types (`Data`, `Arguments`, `ImmutableArray<T>`) in generic constraints over raw `Record<string, unknown>` / `unknown[]`.

## Functions

- Regular `function` declarations for public API exports; arrow functions for short utilities, callbacks, and one-liners.
- Default parameter values are used heavily, especially in destructured options/props: `{ required = false, disabled = false }`.
- Prefer early returns and guard clauses over nested conditionals.
- Immutable helpers intentionally return the original reference when nothing changed — preserve that behaviour instead of always cloning.

### `caller` for attributable errors

Throw-capable helpers accept a `caller` as their **last** parameter, defaulting to the function itself:

```ts
export function assertArray(value: unknown, min?: number, max?: number, caller: AnyCaller = assertArray): void {
	if (!isArray(value, min, max)) throw new RequiredError("Must be array", { received: value, caller });
}
```

When forwarding to another `caller`-aware helper, pass `caller` through so the thrown error attributes to the user's call site, not internal plumbing.

## Classes

- Every `_`-prefixed class member is also marked `private` or `protected` — and vice versa. Never `private foo` without an underscore, never bare `_foo` without an access modifier. The two travel together as one "this is internal" signal.
- (Module-scope private functions/constants use just the `_` prefix — no modifier exists there.)
- Classes that ship convenience instances export them as `ALL_CAPS` constants next to the class: `StringSchema` plus `STRING`, `TITLE`.

## Variables

### Destructuring

- Always destructure when reading 2+ properties from the same object: `const { method, url } = request`.
- Destructure even single properties when the source name is long.
- Rename on destructure to disambiguate or mark validation state: `const { data: unsafeData } = ...`.
- Function parameters destructure inline in the signature, including renames.
- Methods destructure `this`: `const { state, props } = this`.

### Coercion

- `.toString()` on values, not `String(value)`.
- `Number.parseInt` / `Number.parseFloat` over global `Number(...)`; only use `Number(...)` when no method form exists.
- `!!x` for boolean coercion.
- `Number.POSITIVE_INFINITY` not `Infinity`; `Number.isFinite()` not global `isFinite()`.

### Truthy and nullish

- Prefer truthy checks over explicit comparisons: `if (!value) return ...`, not `if (value === undefined || value === "")`.
- Use `||` (not `??`) when empty string and zero should also fall through to the default — this is the common case.
- Reserve `??` for narrow null/undefined defaults, e.g. `process.env.X ?? ""`.
- Use optional chaining + truthiness liberally: `if (items?.length) ...`.

### Object spreads

- Merge defaults with spread, defaults first: `{ ...DEFAULTS, ...options }`.
- Spread order matters and is intentional — don't reorder.
- Forward props with rest spread, preserving order.

## Control flow

### Guard clauses

One-line `if (...) return ...;` without braces, stacked at the top of the function:

```ts
if (!n.length) return "";
if (n.startsWith("44")) return formatUK(n.slice(2));
```

- Module-scope throw guards use the same form: `if (!process.env.API_URL) throw new ReferenceError("...");`
- Combine a `for` loop with a one-line `if` body when filtering: `for (const [k, v] of Object.entries(data)) if (v) ...`

### Loops

- `for...of` over `.forEach()`.
- `Array.from(iter)` over `[...iter]` when converting iterables.
- `function*` generators when assembling a sequence with conditional yields.

### Comments

- Short single-line `//` comments label sections of a function. Sentence case, ending in a period: `// Stop the page reloading.`
- Group several file-level constants under a `// Constants.` label.
- Comment the *why* or the section purpose — never restate what the code says.
- The trailing-empty-comment trick — `Foo, //` — deliberately forces the formatter to keep an argument list multi-line:

  ```ts
  return getClass(
  	BUTTON_CLASS, //
  	getModuleClass(CSS, variants),
  );
  ```

  Preserve these when editing nearby code; don't strip them.

## Async patterns

Export a named `BLACKHOLE` no-op (from a shared `util/function` module) and use `.catch(BLACKHOLE)` to mark a promise rejection as deliberately ignored:

- `_promise.catch(BLACKHOLE)` — a promise not awaited here whose error resurfaces when something else awaits it; the catch stops the unhandled-rejection warning.
- `await flakyOp().catch(BLACKHOLE)` — a known-flaky operation whose rejection is expected and harmless.

Don't replace with an inline `() => {}` or omit the catch — the named symbol documents intent.

## Error handling

- User-input validation errors throw a plain `string` (human-readable, e.g. `"name: Must be 5-50 characters"`), which UI layers consume directly. Let them propagate as-is.
- System / transport problems throw typed error classes (`ResponseError`, `ValueError`, `RequiredError`, …) — e.g. a malformed API response body is a server error, not a user error.
- Aggregated validation failures are `"key: message"` lines joined by `\n`; nested keys chain with `.`.
- The pattern `const message = getMessage(thrown); if (!message) throw thrown;` handles string messages gracefully while re-throwing real errors.

## React components

### Files and naming

- Component files are named after the component they export: `Button.tsx` exports `Button`. CSS modules match: `Button.module.css`.
- `*Layout` suffix for structural layout components; `*Page` suffix for top-level router entries. Page components compose existing library components and should not need custom-styled elements.
- Reusable components live in a shared component library and expose styling options as **variants**.

### Component patterns

- Components are plain named `function` declarations returning `ReactElement` (not `JSX.Element`), never arrow functions.
- Props destructure in the signature with defaults; `{ children, ...variants }` separates content from styling variants.
- Conditional rendering uses `&&` and ternaries inline in JSX — not separate variables or early returns for fragments.
- Inline arrow handlers in JSX are the default, even multi-line ones. Hoist a handler to a module-level `function _name(...)` only when it's pure, doesn't close over state, and is reused.
- Titles, headings, and button labels use **sentence case**: "Change details", not "Change Details".

### CSS modules

- Never use inline `style` props — all styling lives in a colocated `.module.css`.
- Enumerated props for mutually-exclusive scales (`color="red"`, `size="large"`); boolean props for on/off options (`small`, `plain`). Both map to class names via shared `getXxxClass(props)` helpers.
- CSS custom properties provide theming with fallback chains: `var(--button-background, var(--tint-90))`. Every custom property a component's CSS file owns starts with the file's kebab-case name (`Card.module.css` owns `--card-*`), so the originating file is obvious from any `var()` reference.
- Use CSS nesting for variants (`&.small`), pseudo-classes (`&:hover`), and child selectors; use `:where()` to keep specificity low for default child styles.
- CSS modules import as default: `import styles from "./Foo.module.css"` — the one exception to named-exports-only.

## Testing

- Use the runtime's built-in test runner (`bun:test`); tests live next to the module they cover as `*.test.ts`.
- When changing runtime behaviour, update or add the closest colocated test in the same change.
- When changing TypeScript inference or public generic behaviour, include compile-time assignment checks alongside runtime assertions:

  ```ts
  test("TypeScript", () => {
  	const s1: Schema<boolean> = BOOLEAN;
  	const r1: boolean = s1.validate(true);
  });
  ```

- Test files import from the public package barrel, never relative source paths (see Imports & exports).
- Test descriptions are lowercase sentence fragments: `test("formats from leading 0", ...)`. `describe` blocks group by method or option name: `describe("validate()", ...)`, `describe("options.value", ...)`.
- Use `expect.unreachable()` to assert a code path is never reached (e.g. in catch blocks testing thrown errors).
- Shared fixtures live in a dedicated test-utilities module; reuse them rather than redeclaring.

## Documentation

- Every public class, function, and type has a JSDoc docblock. Keep it updated when behaviour changes — a stale comment is worse than none.
- **Strong first line:** one short declarative sentence stating the token's purpose; it must stand alone (tooling lifts it as the description). Further detail goes in bullets below.
- Functions: summary, 0–2 behaviour bullets for anything surprising, `@param` / `@returns` / `@throws`, and one `@example` showing the shortest call site that conveys real usage. Skip the example when the token is micro / self-evident.
- Classes: one-sentence summary, bullet points for notable behaviour and caveats.
- Options-bag members are documented on the interface itself, with `/** description */` and `@default` on each member — not repeated at every constructor.
- Overridden methods and constructors keep minimal docblocks; document behaviour once on the base method.
- When referencing another token in docs, write it as a backtick-quoted name in display style: functions with parens (`formatDate()`), methods qualified (`Store.get()`), components in angle brackets (`<Section>`), classes/constants bare (`StringSchema`, `STRING`).
- Each module has a `README.md` covering purpose, key concepts, and integration examples. Trust source and tests over a README when they conflict — but fix the README rather than leaving it wrong.
- Favour clarity over completeness: a docblock that genuinely helps a reader beats one that mechanically hits every tag. When in doubt, write less.

Example shape:

```ts
/**
 * Get the first item of an array, or `undefined` if it's empty.
 *
 * @param arr The array to read from.
 * @returns The first item, or `undefined` when the array is empty.
 * @example getFirst(["a", "b"]) // "a"
 */
```

## Commits

- Use [Conventional Commits](https://www.conventionalcommits.org/): `feat: add cache provider`, `fix: handle undefined schema value`.
- Commit types feed semantic-release: `feat:` → minor, `fix:` → patch.
- While a project is on `v0`, avoid `BREAKING CHANGE:` footers and `!` markers; describe breaking changes in the commit body instead.

## Workflow

- After making any code change, run the auto-fixer (`bun run fix` — Biome fix + format) before committing.
- Verify with the full check suite: lint, type check, and unit tests (run in parallel where possible).
- When adding or removing a public export, update the nearest barrel `index.ts`; when adding or removing a package subpath, update `package.json` `exports` too.

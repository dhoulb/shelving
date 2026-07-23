# shelving

TypeScript data toolkit with modules for schema validation, database providers, state stores, React integration, and more.

## Code style

All code-style conventions — naming, function prefixes, imports/exports, types, functions, classes, variables, control flow, async patterns, error handling, React component patterns, testing style, and docblock standards — live in [`guides/styleguide.md`](./guides/styleguide.md).

**Before writing any code, read `guides/styleguide.md` and follow it exactly.** The sections below cover only what is specific to this repository.

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
- **Prefer existing helpers** like `withProp`, `withProps`, `omitProps`, `updateData`, `getFilters`, `getOrders`, `getUpdates`, and `validateData` over open-coded object/query/update logic
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
- **Open a PR proactively** once a change is in a reviewable state — don't wait to be asked. This is the normal way work is shared here, and it's especially important for **documentation-site changes**: the `docs.yaml` workflow builds a live preview for every PR at `https://shelving.cc/pr-<number>/` (and comments the link on the PR), which is the only way to eyeball the rendered docs. Any change touching `modules/ui/**`, `modules/extract/**`, `modules/markup/**`, the per-symbol `.md` pages, or docblocks should go up as a PR so the preview is generated.

## Schemas, Queries, and Updates

- Schema classes usually export both the class and ready-made constants or factories, for example `StringSchema` plus `STRING`, or `DataSchema` plus `DATA` / `PARTIAL` / `ITEM`
- Schema defaults and coercions are part of the intended behaviour. Before changing them, check the colocated tests for the current contract
- `validateData()` strips excess keys and removes `undefined` outputs. Keep that behaviour unless you are intentionally changing the validation contract
- Query and update APIs use encoded key syntax like `$order`, `$limit`, `!key`, `key[]`, `key>`, `=key`, `+=key`, and `+[]key`. Extend these via shared helpers rather than bespoke parsing in each provider
- Collections are defined with `Collection` / `COLLECTION` from a collection name, an id schema, and a data schema. Provider code should operate in terms of `Collection`, not loose strings plus ad-hoc validators
- Error-handling style (string throws for user-input validation, typed error classes for system/transport problems) is in the styleguide. One worked example: a bad API response body is a server error (`ResponseError` code 422), not a user error

## Providers, Stores, and React

- DB and API providers are layered wrappers. Prefer extending existing provider chains such as `Through*Provider`, `Validation*Provider`, and `Cache*Provider` patterns instead of duplicating logic
- Wrapped providers are discovered through `source` and helpers like `getSource()` / `requireSource()`, not by reaching into private internals
- `Store.value` intentionally supports suspense-like reads: it can throw a `Promise` while loading or throw `reason` on failure. Do not simplify this into nullable return values
- Store implementations suppress duplicate emissions when values are equal and use the `NONE` sentinel for loading state. Preserve those semantics in new store types
- React context helpers return both a provider component and typed hooks, for example `createDataContext()` and `createCacheContext()`. Follow that pattern for new React integrations

## UI Components

General component and CSS-module patterns (function-declaration components, `ReactElement`, variants, `getModuleClass`, the `--file-name-*` CSS custom property ownership rule, sentence-case copy) are in the styleguide. What follows is specific to this repo's `modules/ui` layer.

- Every reusable component carries a `@kind component` tag in its docblock so the docs extractor labels it as a `component` rather than a `function` (it's grouped and colour-coded separately on the docs site). See the Documentation section. Helper functions that happen to live in a component file (e.g. `getButtonClass`) stay plain functions — no `@kind`
- Styling-scale props (`color`, `size`, `space`, `padding`, `gap`, `tint`, `status`) are defined in `modules/ui/style/` and map to class names via the `getXxxClass(props)` helpers
- **CSS custom property naming exemptions.** The styleguide's rule that a `.module.css` file owns every `--file-name-*` variable it reads has two repo-level exemptions: design-token constants declared at `:root` in `style/base.css` (`--color-*` / `--space-*` / `--size-*` etc.) and the tint ladder (`--tint-00` … `--tint-100`) computed in `style/Tint.module.css`
- **Paint from the ladder; don't rebind the anchor.** A painted component paints every property from a ladder step with a per-property hook in front (`background: var(--card-background, var(--tint-90))`), reading whatever tint is ambient in its scope. A component must **not** set `--tint-50` itself — the anchor is moved only by `color=` / `status=` (which apply `TINT_CLASS` and rebuild the ladder) or at `:root`, so a component never carries a stale ladder and a raw element in `.prose` behaves identically to its component. A component with a fixed semantic colour (`<Deleted>`, `<Inserted>`, `<Link>`) reads its palette token directly (`color: var(--deleted-color, var(--color-red))`) instead of the ladder. Do **not** reintroduce a per-component `--x-tint` anchor hook (removed — tinting is done with the `color=` / `status=` variants), nor the older five-step colour scheme (`--card-color-black` / `-dark` / `-vivid` / `-light` / `-white` and the matching `*-color-bg` / `*-color-border` / `*-color-text` hooks). Both were tried and removed; older issue comments describing them are stale. The tint ladder is documented on the `TINT_CLASS` page (`modules/ui/style/TINT_CLASS.md`) — keep that the source of truth.

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
- [ ] All custom properties owned by this file start with the file name (`--address-*`, etc.) — see the CSS custom property naming rule in the styleguide.
- [ ] If the component paints colour, paint from ladder steps with a per-property hook in front (`background: var(--address-background, var(--tint-90))`) — don't set `--tint-50`; the tint flows in from `color=` / `status=` or an ancestor scope. Read a palette token directly (`var(--color-red)`) only for a fixed semantic colour.
- [ ] `:first-child` / `:last-child` overrides in a separate `@layer overrides { … }` block.
- [ ] TSX extends the styling-prop interfaces (`ColorProps`, `SpacingProps`, `TypographyProps`, etc.) you want to expose and composes the matching `getXxxClass(props)` calls.
- [ ] `@kind component` in the docblock, and a sibling `Address.md` with usage examples and a Styling section (see the Documentation section).

## Testing

Test style (lowercase sentence-fragment descriptions, compile-time type checks, `expect.unreachable()`, colocated `*.test.ts`) is in the styleguide. Repo specifics:

- When changing runtime behaviour, update or add the closest colocated `*.test.ts`
- Reuse fixtures and helpers from `modules/test/` when they fit, especially for collection, provider, and query tests
- Test files always import from the public `shelving/*` barrel, not a relative source path (e.g. `shelving/schema` not `../StringSchema.js`, `shelving/util/array` not `../../util/array.js`) — this verifies the barrel actually re-exports the token. Enforced by a Biome `noRestrictedImports` rule; fixtures under `modules/test` are exempt and stay relative. Resolution of `shelving/*` to source in dev is wired via `tsconfig.json` `paths`

## Documentation

General docblock standards (strong first line, `@example` / `@param` / `@returns` / `@throws` usage, when to write less) are in the styleguide. This section covers the docs site and its repo-specific conventions.

- Every public class, function, and type must have a JSDoc comment. Keep comments updated when behaviour changes — a stale comment is worse than none
- When you add, remove, or meaningfully change a class or function, check and update its docblock in the same commit
- Each module has a `README.md` that acts as the module's guide page. It covers **purpose, key concepts, and integration examples** — how to combine the module's classes and functions to accomplish real tasks (and, for families like `error`, shared traits). When module behaviour changes, check whether the README needs updating
- **Per-class / per-function usage examples** live in a sibling `MyClass.md` / `myFunction.md` next to the source file. `DirectoryExtractor` merges that markdown onto the symbol's own page (`MarkupExtractor` outranks `TypescriptExtractor`), so detailed usage belongs there rather than in the module README. `modules/util/template.md` is the precedent. This applies to UI components too — each reusable component gets a sibling `.md` (`Card.md` next to `Card.tsx`) with usage examples and a **Styling** section (see below)
- Trust source and tests over README if they conflict — but fix the README rather than leaving it wrong

### Docs site

The public docs live at **`https://shelving.cc/`** — every public token ships as a page, and each module / per-symbol `.md` is merged onto it (see below).

- The site is built by the `docs.yaml` workflow (`bun run docs:build`) and published to the `docs` branch, which GitHub Pages serves from the `shelving.cc` custom domain. The workflow writes the `CNAME` file at publish time (the `cname:` option on the deploy step), so there is no `CNAME` committed in the repo.
- A push to `main` publishes to the site root; each PR publishes a preview under `pr-<number>/`, so `https://shelving.cc/pr-<number>/` is the live preview for that PR (linked from the PR's `docs-preview` deployment — see [Pull Requests](#pull-requests)).
- Page URLs are **package-relative**, not source-path-relative: a token's canonical page is `https://shelving.cc/<package>/<name>`, where `<package>` is its `package.json` export subpath. This is the same scheme the `@see` block tags use — see the [docblock standards](#docblock-standards) for the exact rule.

### Cross-references and token display

Whenever a README, per-symbol `.md` page, or docblock names another module or token — a class, function, constant, type, method, property, or component — write it as a **backtick-quoted name in its display style and nothing more**. Do **not** wrap it in a markdown link:

```
`BooleanSchema`
```

Documentation content renders through `<TreeMarkup>`, whose code-span rule resolves each backtick token against the surrounding tree (`getTreeElement()`) and **auto-links it to its canonical page at render time**. A token that resolves becomes a link; one that doesn't (a builtin like `string`, a shell snippet like `bun run fix`) stays plain code. This means cross-references are automatic and maintenance-free — never hand-write ``[`name`](/path)`` link syntax for an internal token. It is liable to rot, and the auto-linker does a better job.

This applies to **"See also" lists** and **inline references** alike. There's no need to link "the first mention only" — repeat the plain backtick reference as often as it reads naturally; the renderer decides what links.

**Token display style.** Format a token so its kind reads from the text. The resolver strips these decorations before lookup, so the styled form resolves directly:

| Kind | Style | Example |
|---|---|---|
| Function | trailing parens | `formatDate()` |
| Method | qualified, trailing parens | `Store.get()` |
| Property | qualified | `Store.value` |
| Component | angle brackets | `<Section>` |
| Class / interface / type / constant | bare name | `BooleanSchema`, `STRING` |
| Module | `shelving/` package prefix | `shelving/schema`, `shelving/firestore/client` |

- **Methods and properties use the qualified `Owner.member` form** — `` `Store.get()` ``, `` `Store.value` `` — never a bare leading-dot `` `.get()` ``. A bare member has no owner to resolve against; the qualified form resolves to the member's page, or falls back to the owner's page when the member has none of its own.
- **Generics stay in the backtick text** as one span — `` `Schema<T>` ``, `` `ItemStore<I, T>` `` — not split into a name plus a trailing `` `<T>` `` chip. The resolver trims the generics for lookup.
- **Modules carry the `shelving/` package prefix** — `` `shelving/schema` ``, `` `shelving/firestore/client` ``, `` `shelving/util/array` `` — matching the `import { … } from "shelving/schema"` specifier and the module page's own title. The prefix is what distinguishes a module reference from a same-named token; the resolver maps it to the module's canonical path.

**What still uses real markdown links.** Auto-linking only covers internal tokens written as backtick code spans, so keep an explicit `[text](target)` link for everything else:

- **External URLs** — `[Conventional Commits](https://www.conventionalcommits.org/)`, GitHub links, spec links.
- **Descriptive prose phrases** that point at a page but aren't a token name — e.g. linking the words "tint ladder" to a page.
- **CSS custom properties** (`--tint-90`, `--space-paragraph`) are **not** tree tokens and never auto-link. Write them as plain backtick code (`` `--tint-90` ``); the Styling-table prose around them names the owning `get*Class` helper as an ordinary backtick reference, which does link.

**`@see` block tags are unaffected** — they still carry the full `https://shelving.cc/<package>/<name>` URL (see the docblock standards below), since IDE hover needs an absolute link, not a docs-site-relative one.

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

**Sugar instances.** Open the docblock with one line that states the class it instantiates (as a plain backtick reference, which auto-links) and the equivalent constructor call, since that first line becomes the card `description`:

  ```ts
  /**
   * Sugar instance of `StringSchema` for an unconstrained string. Equivalent to `new StringSchema({})`.
   *
   * @example STRING.validate(123); // Returns "123"
   * @see https://shelving.cc/schema/STRING
   */
  export const STRING = new StringSchema({});
  ```

  When the instance is built by composing a sugar factory rather than `new` (e.g. `NULLABLE_TITLE = NULLABLE(TITLE)`), name the equivalent factory call instead: `` Equivalent to `NULLABLE(TITLE)`. ``, and name the wrapped sugar instance as a plain backtick reference (`` `TITLE` ``).

**Sugar factories.** Write them as regular `function` declarations, not arrow-consts. A `function` declaration classifies as `kind: "function"` on the docs site (an arrow-const wrongly shows as a `constant`), gives a named stack trace, and is the preferred form for public-API exports anyway (see the styleguide's Functions section). Mark a factory in its docblock with a short line naming the class it builds, on its own paragraph after the summary:

  ```ts
  /**
   * Create a `DataSchema` for a set of properties.
   *
   * Sugar factory for `DataSchema`.
   */
  export function DATA<T extends Data>(props: Schemas<T>): DataSchema<T> {
  	return new DataSchema({ props });
  }
  ```

- The canonical wording is exactly `` Sugar factory for `ClassName`. `` — plain text (no `*asterisks*` or `_underscores_`; the `markup` renderer would make those bold or italic respectively), with the class name as a plain backtick reference that auto-links to its docs page. When a factory composes other factories (e.g. `NULLABLE_DATA` wraps a `DataSchema` in a `NullableSchema`), name the class it ultimately returns

### Docblock standards

General docblock voice and tag standards are in the styleguide. These points are specific to this repo's docs extractor and site:

- **Overridden methods and constructors don't get their own pages.** The extractor publishes a page per public token, but a method that `override`s a base-class method, and every class `constructor`, are not among them. Keep their docblocks minimal or omit them entirely, and **never give them a `@see` tag** — it would point at a page that doesn't exist. Document the behaviour once on the base method; an `override` only needs a short line when it changes the contract in a way worth noting, and a constructor rarely needs anything (its options bag is documented on the `*Options` interface, which flattens onto the class page).
- **Strong first line (becomes the `description`).** The extractor lifts the first paragraph as the `description` shown on cards and `<meta>` tags, so it must stand alone.
- **`@example`.** Delete an `@example` when a sibling `.md` page already carries usage examples for the token (don't maintain the same example in two places — the `.md` wins).
- **Don't duplicate a documented token's docs at the call site.** The docs renderer resolves each `@param` / `@returns` / `@throws` *type* by exact name against the docs tree. When that type is a **documented ("internal") token**, the row already links it and falls back to the token's own `description`; an **options-bag / props parameter** additionally **flattens** into one row per interface member, each carrying that member's own description and `@default`. (Heritage is **not** flattened — only the interface's directly-declared members appear.) So a JSDoc rule that merely restates what the token already says is redundant noise.
  - **Drop** the rule when its type is a documented token and the prose adds nothing beyond that token's own description. The flagship cases are the **`@param options` umbrella line and every `@param options.x` sub-line** of an options bag whose type is a documented interface (e.g. a `*SchemaOptions` or a `*Props`), and any `@returns` / `@throws` whose text just restates its documented token.
  - **Keep** the rule when its type is **not** a documented token (primitives / builtins like `string`, `number`, `boolean`, `RegExp`, `URL`, `unknown`, plain arrays / unions — there's no page to fall back to), when it gives a **positional parameter its role** (e.g. `@param arr The array to read from` stays even though `ImmutableArray` is documented), or when it explains **custom usage** the token can't (e.g. a schema `@throws` enumerating the specific `string` validation messages).
  - **Move, don't lose.** Per-subclass / per-call specifics that lived in a dropped constructor `@param` — a member's description, or a fixed default like "max defaults to 16" — move **onto the options / props interface member** as `/** description */` + `@default 16`, so the flattened row still shows them. Defaults of *inherited* (non-redeclared) options that have nowhere to flatten are simply dropped — they're minor and visible in source.
  - **Where it bites:** mainly options bags (schemas) and React component props, but it applies anywhere a rule references a documented token.
  - **Naming a destructured bag.** A parameter destructured inline in the signature (`{ min, max }: StringSchemaOptions`) has no name of its own, so the Param column derives one: an explicit `@param` name wins, else the rest element (`...options`), else a type-derived fallback (`props` for a `*Props` type, otherwise `options`). The signature still shows the full `{ … }`. Most options bags already end with `...options` and need nothing; when a bag has no rest element and the fallback reads wrong, add a one-word `@param options` (or `@param props`) line to name it — preferred over adding an overload, since it doesn't change the type contract.
- **`@see` docs-site link.** Every token published on the docs site gets a `@see` block tag pointing at its page, so VS Code hover reveals a clickable link. Prefer the `@see` block tag over inline `{@link}` — it renders better in the hover popup. The URL pattern mirrors the docs-site routing:

  ```
  @see https://shelving.cc/<package>/<name>
  ```

  where `<package>` is the symbol's **package export subpath** — the entry it's published under in `package.json` `exports`, which is the top-level module folder (`schema`, `db`, `store`, `ui`, …) for single-index packages, or `util/<file>` and `firestore/<client|lite|server>` for the wildcard / multi-entry exports — and `<name>` is the exported symbol. The deeper source-file path collapses to that package subpath. So `modules/schema/BooleanSchema.ts`'s `BooleanSchema` class → `https://shelving.cc/schema/BooleanSchema`; `modules/db/store/QueryStore.ts`'s `QueryStore` → `https://shelving.cc/db/QueryStore`; `modules/util/array.ts`'s `getArray` → `https://shelving.cc/util/array/getArray`; a class member appends its own name → `https://shelving.cc/schema/BooleanSchema/validate`.

Example shape:

```ts
/**
 * Get the first item of an array, or `undefined` if it's empty.
 *
 * @param arr The array to read from.
 * @returns The first item, or `undefined` when the array is empty.
 * @example getArray(["a", "b"]) // "a"
 * @see https://shelving.cc/util/array/getArray
 */
```

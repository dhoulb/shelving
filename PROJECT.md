# PROJECT.md

- Living list of outstanding todos, known gaps, and deferred decisions for the shelving codebase.
- Bots should read this at session start and update it when work completes or new gaps are found.
- Changes to this file can be committed directly to main with the commit message `project`, and pushed to origin without a PR.
- Items use the format `- [ ] **999** — Item`
- Items grouped into **Todo**, **Blocked**, and **Later** sections. Use these groups when reporting or summarising the list.
- Every item has a unique number (100–999) for easy reference. Pick a random unused number when adding a new item.

---

## Todo

- [ ] **828** — Make a `ChildrenProps` and `OptionalChildrenProps` interfaces somewhere and `extends` them everywhere rather than defining `readonly children: ReactNode` and `readonly children?: ReactNode | undefined` in every set of props.
- [ ] **357** — Investigate a Meta-based "wrap" signal so render modes (and probably layouts) can be dispatched from inside the React tree at the right level. The SSR caller would set `<Meta wrap="html">` once; `<App>` (or a similar root) reads it and conditionally emits `<html lang={language}><body id="root">{…}</body></html>`. Lets the language and other shell attributes come from inside the React tree rather than being duplicated at the SSR call site. Probably generalises to layout dispatch (`wrap="centered"`, `wrap="sidebar"`, etc.) the same way.
- [ ] **419** — Stop hardcoding `language="en"` in the docs site. Currently set both inside `<DocsApp>` (`<App language="en">` for descendant Meta context) and at the SSR call site (`<Meta language="en">` outside `<HTML>` so the `<html lang>` attribute resolves). Goes away once item 357's wrap signal lets the language flow through from inside, or sooner if `<HTML>` gains a `lang` prop.
- [ ] **637** — Expand `createMapper()` (`modules/ui/misc/Mapper.tsx`) to support mapping by function/class component types, not just intrinsic string types. Switch internal storage from a plain dictionary to a `Map<string | ComponentType, ComponentType>` so component references can be used as keys. Add a `components` array to the `Mapping` type for `[source, target]` entries with a `mapEntry(source, target)` helper for type-safe construction. Target use case: deeply overriding components (e.g. `<input>` in form generation) without re-wrapping.
- [ ] **274** — Populate module `README.md` files with proper documentation for each module. Write a guide explaining how to build documentation sites using the tree module, extractors, and `TreeApp` shell — use `scripts/docs.tsx` as the working example.
- [ ] **463** — Move the default tree element renderers (page, menu, card components for `tree-directory`, `tree-file`, `tree-function`, etc.) from `scripts/docs.tsx` into `modules/ui/tree/` as reusable defaults so every consumer doesn't have to define them from scratch.
- [ ] **641** — Move markup rules from `.ts` to `.tsx` so they construct output via JSX (`<strong>{...}</strong>`) instead of building `Element` object literals and injecting `$$typeof` manually. Rules should have zero knowledge of React internals — they just write JSX and the configured transform (React, Preact, anything compatible) handles `$$typeof` and friends. Audit `modules/markup/rule/` for places that construct elements by hand and convert them. Bonus: makes the rules much more readable.
- [ ] **715** — Merge same-slug `.md` files into their corresponding `.ts` file elements during extraction. Files like `TEMPLATE.md` alongside `template.ts` should have their markdown content absorbed into the `tree-file` element for `template`, rather than being skipped or colliding. The `.md` is effectively the documentation for the `.ts` file and should contribute `title` (from its first `<h1>`), `description`, and `content` (the parsed markdown body) to the TypeScript file element. Strategy: most likely a post-extraction merge step in `DirectoryExtractor` that collapses children sharing the same `key`, with the `.md` providing the doc surface and the `.ts` providing the symbol children. Until this lands, `FileExtractor` falls back the TS file title to the unslugged filename (e.g. `template.ts` → `"template"`).
- [ ] **392** — Expand `DocumentationElement` (and `TypescriptExtractor`) to capture more from JSDoc:
	1. Multiple `signature` strings — an array, so function/method overloads can be represented (each overload's signature is a separate entry).
	2. Richer `returns` — model like `params`: an array of `{ type, description }` entries so multiple `@returns` tags (e.g. union return types documented separately) can be represented.
	3. Support `@throws` tags — array of `{ type, description }` for each documented thrown error.
	4. Audit `modules/` for every `@tag` we actually use in docblocks and decide which to expose on `DocumentationElement` (likely candidates: `@deprecated`, `@see`, `@todo`, `@since`).
	5. Then go wider — survey common JSDoc/TSDoc tags (`@default`, `@remarks`, `@beta`, `@experimental`, `@internal`, `@template`, `@typeParam`, `@link`) and add the ones that would meaningfully improve generated docs.

---

## Blocked

Items waiting on browser/runtime/TS support before they can be actioned.

- [ ] **234** — Util: switch `base64.ts` to use `Uint8Array.toBase64()` — waiting for broad browser support ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64)).
- [ ] **673** — Util: switch `format.ts` to use `Intl.DurationFormatOptions` — waiting for it to land in the TS lib.
- [ ] **412** — Util: switch `format.ts` to use `Intl.DurationFormat().format()` — waiting for broad browser support and TS lib availability.
- [ ] **945** — Util: remove the `Symbol.dispose` polyfill in `dispose.ts` — waiting for native browser support.

---

## Later

- [ ] **342** — Write the module documentation in `README.md` (currently placeholder).
- [ ] **517** — Fix partial validation in `ValidationDBProvider` — currently only validates top-level keys, not nested structure of the object.
- [ ] **764** — Implement stale-while-revalidate in `EndpointStore`: set `_age_` to `undefined` instead of clearing the value, so the current value persists but is old enough to trigger a refetch.
- [ ] **621** — Markup: support loose lists — list items containing paragraphs (`\n\n` double line breaks), wrapping contents in `<p>` tags (`childContext` is `"block"`).
- [ ] **489** — Markup: support pipe table syntax (`|col|col|`).
- [ ] **156** — Markup: support todo list syntax (`- [x]` / `- [ ]`).
- [ ] **738** — Markup: support unified reference/footnote/sidenote syntax that combines reference links, sidenotes, and footnotes into a single `<dl>`-producing format.
- [ ] **891** — Util: convert confusable characters (e.g. `ℵ` alef symbol, `℮` estimate symbol) to their letterlike equivalents in `string.ts`.
- [ ] **178** — Cut a stable v1.0 release with proper semver once the API is settled.
- [x] **556** — Build an API reference / docs site generated from JSDoc (e.g. TypeDoc or similar). Done: `scripts/docs.tsx` extracts from source and renders via `TreeApp`.
- [ ] **823** — Add additional DB providers: SQLite via `bun:sqlite`, PlanetScale, Turso.
- [ ] **128** — Move focus utilities from `sm-platform` into shelving as a reusable module.
- [ ] **981** — Add a general `Provider` base class with an `action()` method so basic wrapper classes can live in shelving rather than downstream projects.

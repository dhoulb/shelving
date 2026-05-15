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
- [ ] **637** — Expand `createMapper()` (`modules/ui/misc/Mapper.tsx`) to support mapping by function/class component types, not just intrinsic string types. Switch internal storage from a plain dictionary to a `Map<string | ComponentType, ComponentType>` so component references can be used as keys. Add a `components` array to the `Mapping` type for `[source, target]` entries with a `mapEntry(source, target)` helper for type-safe construction. Target use case: deeply overriding components (e.g. `<input>` in form generation) without re-wrapping.
- [ ] **274** — Write a guide explaining how to build documentation sites using the tree module, extractors, and `TreeApp` shell — use `docs/build.tsx` and `docs/start.tsx` as working examples.
- [ ] **137** — Populate module `README.md` files with proper documentation for each module. Many modules currently have placeholder or missing READMEs; once written, the docs site picks them up automatically as each directory's index content (via the new `DirectoryExtractor` index-file absorption).
- [ ] **641** — Move markup rules from `.ts` to `.tsx` so they construct output via JSX (`<strong>{...}</strong>`) instead of building `Element` object literals and injecting `$$typeof` manually. Rules should have zero knowledge of React internals — they just write JSX and the configured transform (React, Preact, anything compatible) handles `$$typeof` and friends. Audit `modules/markup/rule/` for places that construct elements by hand and convert them. Bonus: makes the rules much more readable.
- [ ] **392** — Expand `DocumentationElement` (and `TypescriptExtractor`) to capture more from JSDoc:
	1. Multiple `signature` strings — an array, so function/method overloads can be represented (each overload's signature is a separate entry). Currently overloads produce multiple `tree-documentation` children with the same `key`, which overwrite each other when rendered.
	2. Richer `returns` — model like `params`: an array of `{ type, description }` entries so multiple `@returns` tags (e.g. union return types documented separately) can be represented.
	3. Support `@throws` tags — array of `{ type, description }` for each documented thrown error.
	4. Audit `modules/` for every `@tag` we actually use in docblocks and decide which to expose on `DocumentationElement` (likely candidates: `@deprecated`, `@see`, `@todo`, `@since`).
	5. Then go wider — survey common JSDoc/TSDoc tags (`@default`, `@remarks`, `@beta`, `@experimental`, `@internal`, `@template`, `@typeParam`, `@link`) and add the ones that would meaningfully improve generated docs.
- [ ] **472** — Refactor `modules/util/url.ts` and `modules/util/path.ts` so URL and path utilities share a consistent shape, with absolute values represented as real classes instead of just typed strings. Branch: `claude/refactor-url-path-classes-uHdIa`.
    - **`AbsoluteURL` class** in `url.ts` that `extends URL` (the builtin). Its constructor takes a URL string / `URL` instance / relative path plus an optional base (a `URLString` or another `AbsoluteURL`), and asserts the result is a true URL (has `protocol://host`) — not just any URI. Instances are guaranteed-absolute by construction, so `isURL(value)` collapses to `value instanceof AbsoluteURL` for a fast path; `getURL` / `requireURL` / `assertURL` continue to accept loose inputs and produce / verify `AbsoluteURL` instances.
    - **`AbsolutePath` class** in `path.ts` mirroring `AbsoluteURL`. Constructor signature: `new AbsolutePath(input: AbsolutePathString | RelativePathString | AbsolutePath, base: AbsolutePathString | AbsolutePath)` — accepts a relative or absolute path as the first arg, and an absolute base (string or instance) as the second. Stores the resolved absolute path. `isPath(value)` becomes `value instanceof AbsolutePath`; `getPath` / `requirePath` / `assertPath` follow the same pattern as the URL helpers.
    - **Rename the existing string types** for consistency with `URLString`:
        - `AbsolutePath` (the string type) → `AbsolutePathString`
        - `RelativePath` (the string type) → `RelativePathString`
        - `Path` (the union) → `PathString`
        - Frees up `AbsolutePath` as the class name. Update all 79+ references across `modules/**` (see `grep -rn "\\bAbsolutePath\\b"`).
    - **Keep the function-prefix contracts** from `AGENTS.md`: `is*` returns `value is AbsoluteURL` / `value is AbsolutePath`, `assert*` uses `asserts value is …`, `get*` returns instance or `undefined`, `require*` returns instance or throws `RequiredError`. Keep `caller: AnyCaller = thisFunction` on throwing helpers.
    - **Preserve existing behaviour**: `BaseURL` (trailing-slash variant), `matchURLPrefix`, `matchPathPrefix`, `splitPath` / `joinPath`, `isPathActive` / `isPathProud`, and the segment helpers (`isPathSegment`, `getPathSegment`) all keep working — update their signatures to use the new class / string-type names but don't change their semantics.
    - **Tests**: update `path.test.ts` and `url.test.ts` to cover both the class constructors (valid + invalid inputs, base resolution, `instanceof` checks) and the renamed string types. Test files import from the highest applicable barrel (`shelving/util`).
    - **Barrel + public API**: re-export `AbsoluteURL` and `AbsolutePath` classes from `modules/util/index.ts` alphabetically; check `modules/index.ts` and `package.json` `exports` don't need touching (these live under `util`, which is already public).
- [ ] **718** — Polish styling of documentation cards (`DocumentationCard`) and file cards (`FileCard`) in `modules/ui/docs/`. Currently plain `<div><h3><code>name</code></h3>…</div>` — needs typography, spacing, dividers, proper code-block treatment, and better visual hierarchy.
- [ ] **405** — General styling polish of the entire documentation site. Typography scale, spacing rhythm, page max-width, code blocks, table treatment, link styles, sidebar treatment, mobile responsiveness. Bring it in line with the rest of the shelving design language.
- [ ] **829** — Add colourful tags for code elements based on `kind` (e.g. `function`, `class`, `interface`, `type`, `constant`, `method`, `property`). Implement a `DocumentationKind` component that renders the `kind` prop as a small colour-coded badge — distinct hue per kind. Surface the badge in cards, on the page header, optionally in the sidebar, and anywhere else a documented symbol appears. Define the colour palette as CSS custom properties so it can be reused elsewhere in the design system.
- [ ] **692** — Change `FileExtractor` (and subclasses) so the `name` prop is the basename **without** extension (e.g. `"OptionalSchema"`, not `"OptionalSchema.ts"`). The `.ts` clutters menus and cards. The extension can still be derived from the source filename if anything ever needs it, but `name` should be display-ready.

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
- [x] **556** — Build an API reference / docs site generated from JSDoc (e.g. TypeDoc or similar). Done: `docs/build.tsx` extracts from source and renders via `TreeApp` + reusable components in `modules/ui/docs/`.
- [x] **583** — Clean up and refactor the `docs/` scripts. Done: split into `docs/css.ts` (CSS extraction via `Bun.build` to a temp dir), `docs/app.tsx` (`renderPage` / `buildPage` / `buildApp`), `docs/env.ts` (config constants), and minimal `build.tsx` / `start.tsx`. No more spawn-self process dance; everything runs in-process.
- [x] **671** — Multi-segment routing for the docs site. Done in `TreeApp.tsx`: the catch-all route is now split into `"/"` (renders the root) and `"/**"` (anonymous double-star captures the multi-segment remainder under index `"0"`, which is destructured as `{ 0: sub }` and prefixed back into an absolute path for `<TreePage>`). Named multi-segment placeholders in `template.ts` weren't needed in the end.
- [x] **463** — Move the default tree element renderers (page, menu, card components for `tree-directory`, `tree-file`, `tree-documentation`) into the UI module as reusable defaults so every consumer doesn't have to define them from scratch. Done: components live in `modules/ui/docs/` and are wired in as defaults on `TreePage`, `TreeMenu`, and `TreeCards`.
- [ ] **823** — Add additional DB providers: SQLite via `bun:sqlite`, PlanetScale, Turso.
- [ ] **128** — Move focus utilities from `sm-platform` into shelving as a reusable module.
- [ ] **981** — Add a general `Provider` base class with an `action()` method so basic wrapper classes can live in shelving rather than downstream projects.

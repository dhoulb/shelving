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
- [ ] **556** — Build an API reference / docs site generated from JSDoc (e.g. TypeDoc or similar).
- [ ] **823** — Add additional DB providers: SQLite via `bun:sqlite`, PlanetScale, Turso.
- [ ] **128** — Move focus utilities from `sm-platform` into shelving as a reusable module.
- [ ] **981** — Add a general `Provider` base class with an `action()` method so basic wrapper classes can live in shelving rather than downstream projects.

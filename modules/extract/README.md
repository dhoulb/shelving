# extract

Turn a folder of source files into a navigable tree of documentation. `extract` is the engine behind the Shelving documentation site itself.

API references and hand-written guides usually live in separate tools. `extract` unifies them: it reads files and directories from disk and produces a single [`TreeElement`](/util/tree/TreeElement) tree describing every directory, file, and exported code symbol. A directory's `README.md` becomes that directory's intro page. A TypeScript file's exports become documented symbols. A `name.md` file sitting next to `name.ts` is merged onto the same page. One tree, one site, prose and source together.

Pair the tree with the [`shelving/ui`](/ui) and you have a complete static documentation site — exactly how this site is built.

## Concepts

### Extractors

An [`Extractor`](/extract/Extractor) converts an input into a [`TreeElement`](/util/tree/TreeElement). Extractors are composable — an outer extractor delegates to inner ones.

| Extractor | Input | Output |
|---|---|---|
| [`DirectoryExtractor`](/extract/DirectoryExtractor) | a directory path | a `tree-element` node, recursing into subdirectories |
| [`FileExtractor`](/extract/FileExtractor) | a file | a `tree-element` node holding the raw text |
| [`MarkupExtractor`](/extract/MarkupExtractor) | a `.md` file | a `tree-element` node with `title` taken from the first `# heading` |
| [`TypescriptExtractor`](/extract/TypescriptExtractor) | a `.ts` / `.tsx` file | a `tree-element` node whose children are the exported symbols |

`DirectoryExtractor` is the entry point. It walks a directory, dispatches each file to a `FileExtractor` by extension, and recurses into subdirectories.

### The tree

Every extractor produces a [`TreeElement`](/util/tree/TreeElement) (see [`shelving/util/tree`](/util/tree)). There are two element types:

- `tree-element` — a directory or a file. A directory's content is absorbed from an index file; a file's children are its exported symbols (for TypeScript). Its `source` records the absolute path it came from.
- `tree-documentation` — one documented symbol (function, class, type, constant), carrying the `signatures`, `params`, `returns`, `throws`, and `examples` parsed from its JSDoc.

The tree is plain, JSON-serialisable data. The docs build writes it to `tree.json` so the browser can fetch it and hydrate.

### Index files

A directory's index file — `README.md` by default — is *absorbed* into the directory element. Its title, description, and content become the directory's own. This is why writing a `README.md` is all it takes to give a directory an intro page.

### Same-key merging

Files whose names slugify to the same key are merged into one element. `template.md` and `template.ts` both have the key `template`, so they become a single page: the Markdown supplies the prose, the TypeScript supplies the documented symbols. Markdown has the higher `priority`, so it wins on `title`.

This is the pattern behind every `util/*.ts` file paired with a `name.md` guide — the hand-written page and the extracted API land together.

## Building a documentation site

The pipeline, end to end. `docs/build.tsx` and `docs/render.tsx` in this repository are the working reference; `renderApp` in `docs/render.tsx` is the best-annotated example.

### 1. Extract the tree

```ts
import { DirectoryExtractor } from "shelving/extract";

const root = await new DirectoryExtractor().extract("/path/to/modules");
```

`root` is a `tree-element` node — the whole project as one tree.

### 2. Render with `<TreeApp>`

[`<TreeApp>`](/ui/TreeApp) is the shell. Give it the tree and it produces a complete site — a sidebar menu, routing, and one page per element.

```tsx
import { TreeApp } from "shelving/ui";

<TreeApp tree={root} />
```

Internally `<TreeApp>` wires together:

- [`<Navigation>`](/ui/Navigation) — owns URL state and intercepts link clicks.
- [`<Router>`](/ui/Router) — `/` renders the root; `/{...path}` catches every deeper path.
- [`<TreePage>`](/ui/TreePage) — resolves the URL path to a tree element and renders it.

`<TreePage>` dispatches on element type: `tree-element` renders as `<TreePage>` and `tree-documentation` as [`<DocumentationPage>`](/ui/DocumentationPage).

### 3. Build static pages

`docs/build.tsx` shows the production build: extract the tree, write `tree.json`, bundle the browser and server scripts, then render every page to static HTML. `docs/render.tsx`'s `renderApp` enumerates every page from the canonical path keys of [`flattenTree()`](/util/tree/flattenTree) and writes one `index.html` per page. The browser later fetches `tree.json` and hydrates the same React tree the server rendered.

## Customising

### Controlling what gets indexed

[`DirectoryExtractor`](/extract/DirectoryExtractor) accepts a [`DirectoryExtractorOptions`](/extract/DirectoryExtractorOptions) object:

```ts
new DirectoryExtractor({
  index: [/^readme\.md$/i],                     // filenames treated as the directory index
  extractors: { md: new MarkupExtractor() },  // file extension → extractor
  ignore: [/\.test\.tsx?$/i],                   // entries to skip
  base: "/abs/path",                            // base for resolving relative paths
});
```

By default, test files, hidden files, underscore-prefixed files, and `node_modules` are skipped, and `.md`, `.ts`, `.tsx`, and `.txt` files are extracted.

### Overriding page renderers

The tree components render through *mappings* — wrap a subtree to swap a renderer for one element type:

- `<TreePageMapping>` — the full-page component for an element type.
- `<TreeMenuMapping>` — the sidebar menu renderer.
- `<TreeCardMapping>` — the card renderer used in directory listings.

```tsx
<TreePageMapping mapping={{ "tree-element": MyTreePage }}>
  <TreeApp tree={root} />
</TreePageMapping>
```

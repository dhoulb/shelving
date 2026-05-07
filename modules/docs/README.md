# docs

Static documentation generator for the shelving codebase. Walks the source tree, extracts symbols and JSDoc with the TypeScript compiler API, then renders one HTML page per source file using components built on top of the shelving/ui library.

## Concepts

The pipeline has two halves.

**Indexing** (`util/`) is framework-agnostic and produces a tree of `PathNode`s:

- `util/file.ts` reads a single source file and turns it into a `PathNode`. Source files (`.ts`, `.tsx`, `.js`, `.jsx`) are parsed via the TypeScript compiler API; everything else is captured as a plain-text description.
- `util/typescript.ts` walks a `SourceFile` and yields `SymbolNode`s for exported functions, classes, interfaces, types, and constants — including method and property children of classes.
- `util/docblock.ts` parses JSDoc descriptions, `@param`, `@returns`, and `@example` tags.
- `util/nodes.ts` defines the node types and provides `nestPathNodes()` to lift a flat list of files into a directory tree, plus helpers that merge duplicate symbol declarations.
- `util/paths.ts` and `util/fs.ts` handle output paths and filesystem writes.

**Rendering** (`components/` and `index.tsx`) turns that tree into HTML:

- `components/Page.tsx` wraps each page in a full HTML document using `SidebarLayout`. The `App` theme class is applied directly to `<body>` so static HTML inherits the design tokens without client-side JS.
- `components/Sidebar.tsx` renders the recursive nav tree with active highlighting and per-symbol fragment links.
- `components/SymbolCard.tsx` renders one card per exported symbol — name, kind tag, signatures, params, returns, examples, and any nested members.
- `components/Storybook.tsx` is the UI library showcase: a single page exhibiting every component in `shelving/ui` that renders meaningfully without client-side JS.
- `index.tsx` ties it together with `writeDocs()`.

## CSS modules at SSR time

`util/cssModules.ts` is a Bun plugin that lets `import styles from "./Foo.module.css"` work during a script run. It:

- Reads the CSS file and finds every `.local-name` selector.
- Hashes the file path into a short suffix and rewrites every selector to `.local-name__hash`.
- Stashes the transformed CSS in a registry.
- Returns a JS module exporting `{ "local-name": "local-name__hash", … }` so `styles.foo` resolves to a real class name.

After every page is rendered, `writeDocs()` writes a single concatenated `style.css` containing every transformed module touched during the run.

The plugin must be active before any `*.module.css` import is resolved, which is why the entry script is invoked with `bun --preload ./scripts/docs-preload.ts ./scripts/docs.tsx` — preload runs before any other module is loaded.

## Usage

Build the site locally:

```sh
bun run docs
```

The HTML and stylesheet land in `.build/docs/`.

To add an extra page that isn't a source file (the storybook is one), pass it to `writeDocs`:

```ts
await writeDocs(dirs, OUTPUT_PATH, [
  {
    path: "storybook",
    title: "UI library",
    lede: "Live examples of every component in shelving/ui.",
    body: <Storybook />,
  },
]);
```

## See also

- [ui](../ui/README.md) — the component library the docs site is built on.
- [markup](../markup/README.md) — renders module README markdown bodies into JSX inside the docs.

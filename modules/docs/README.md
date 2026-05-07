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

## Build pipeline

`scripts/docs.tsx` is a thin orchestrator. It runs `Bun.build()` over `scripts/docs-render.tsx`, which is where the actual indexing-and-rendering work happens. Bun's bundler natively resolves `*.module.css` imports — it scopes class names per file and emits a single CSS asset alongside the bundled JS. The orchestrator then runs the bundled entry (writing the HTML pages) and copies the bundled CSS asset to `.build/docs/style.css`.

The split lets us keep the renderer as plain TSX with `import styles from "./X.module.css"` everywhere — Bun handles the rest, and we don't reimplement CSS modules.

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

# Documentation pages

Page and card renderers for the three tree element types. These are the defaults wired into [ui/tree](/ui/tree) — use them directly if you need a page or card outside the tree shell, or replace them via the `*Mapping` components.

## Element types and their renderers

| Element type | Page renderer | Card renderer |
|---|---|---|
| `tree-directory` | `DirectoryPage` | `DirectoryCard` |
| `tree-file` | `FilePage` | `FileCard` |
| `tree-documentation` | `DocumentationPage` | `DocumentationCard` |

Each renderer receives the props of its element type (title, name, description, content, children, etc.). Card renderers also accept a `path` prop — the parent's URL path — so each card can compute its own `href` as `joinPath(path, name)`.

## Pages

**`DirectoryPage`** renders the directory's title, its `README.md` prose via `<Markup>`, then its children as a `<TreeCards>` listing.

**`FilePage`** renders the file's title, its prose content, then its child code symbols as `<TreeCards>`. It reads the current URL pathname from context so each symbol card links to the right path.

**`DocumentationPage`** is the most detailed renderer. It renders: a `<DocumentationKind>` tag, type signatures as preformatted blocks, prose content, and conditional sections for parameters, returns, throws, and examples. Child symbols follow as cards.

## Cards

Cards are compact link tiles used in `<TreeCards>` directory listings.

**`DirectoryCard`** and **`FileCard`** show the title and prose lead-in inside a `<Card>` linked to the element's path.

**`DocumentationCard`** shows the symbol name alongside its `<DocumentationKind>` tag, the first signature block, and a prose lead-in.

## DocumentationKind

`<DocumentationKind>` renders a colour-coded `<Tag>` for a symbol's `kind` string. Built-in colour map:

| Kind | Colour |
|---|---|
| `function` | blue |
| `class` | purple |
| `interface` | cyan |
| `type` | pink |
| `constant` | green |
| `method` | orange |
| `property` | yellow |

Unknown kinds render as an uncoloured tag.

## Usage

The renderers are used automatically via [ui/tree](/ui/tree). To render a single page or card manually, spread element props directly:

```tsx
import { DirectoryPage, FilePage, DocumentationPage } from "shelving/ui";

<DirectoryPage {...directoryElement.props} />
<FilePage {...fileElement.props} />
<DocumentationPage {...documentationElement.props} />
```

To replace a renderer for one element type across the whole site, use `<TreePageMapping>` or `<TreeCardMapping>` from [ui/tree](/ui/tree).

## See also

- [ui/tree](/ui/tree) — `<TreeCards>` and the `*Mapping` override mechanism
- [extract](/extract) — produces the `TreeElement` tree whose props these renderers consume
- [markup](/markup) — renders the Markdown `content` field carried by each element

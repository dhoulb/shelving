# Documentation pages

Page and card renderers for the two tree element types. These are the defaults wired into [ui/tree](/ui/tree) — use them directly if you need a page or card outside the tree shell, or replace them via the `*Mapping` components.

## Element types and their renderers

| Element type | Page renderer | Card renderer |
|---|---|---|
| `tree-element` | `TreePage` | `TreeCard` |
| `tree-documentation` | `DocumentationPage` | `DocumentationCard` |

Each renderer receives the props of its element type (title, name, description, content, children, etc.). Card renderers also accept a `path` prop — the parent's URL path — so each card can compute its own `href` as `joinPath(path, name)`.

## Pages

**`TreePage`** renders a generic `tree-element` (a directory or file): its title, any absorbed prose content via `<Markup>`, then its children as a `<TreeCards>` listing. The `path` prop is threaded down so each child card links to the right path.

**`DocumentationPage`** is the most detailed renderer. Before the title it renders `<TreeBreadcrumbs>` (a trail of links to the page's ancestors, from [ui/tree](/ui/tree)). The title carries a `<DocumentationKind>` tag. Below the title `<DocumentationButtons>` lists the symbol's relations (`member of`, `extends`, `implements`, `overrides`) as links. Then it renders the signature(s) as preformatted blocks (each carries the symbol's name, e.g. `refreshAll(maxAge?: number): Promise<void>`, with `readonly` folded into property signatures), prose content, and conditional sections for parameters, returns, throws, and examples. Child symbols follow as cards.

## Linking between symbols

Three components turn the raw relational metadata the extractor records (`class`, `readonly`, `overrides`, `extends`, `implements`) into navigation:

**`DocumentationButton`** links to another symbol by reference string — a bare name (`"Store"`) or a qualified member (`"Store.get"`). It resolves the reference against the flattened tree map from `<TreeProvider>` (see [ui/tree](/ui/tree)): a hit becomes a link, a miss (e.g. a builtin like `Serializable`) renders as a non-linking label so the text still reads. Defaults to `small plain` button styling.

**`DocumentationButtons`** renders a symbol's relations as a `<nav>` column of labelled `<DocumentationButton>`s — `overrides AbstractStore.get`, `implements Serializable`, `member of Store`, etc. Carries paragraph-level block spacing by default (composes `PARAGRAPH_CLASS`), overridable with `space-*` variants. Renders nothing when the symbol has no relations. Used by both `DocumentationPage` and `DocumentationCard`.

(The ancestor breadcrumb trail rendered above the title is `<TreeBreadcrumbs>`, which lives in [ui/tree](/ui/tree) since it works with any tree, not just documentation.)

## Cards

Cards are compact link tiles used in `<TreeCards>` directory listings.

**`TreeCard`** shows the title and prose lead-in inside a `<Card>` linked to the element's path — used for both directories and files.

**`DocumentationCard`** leads with the symbol's signature(s) as monospace `<Subheading>`s (one per overload) — the signature already carries the name (and `readonly` for properties), so there's no separate title or kind tag; the card's *colour* carries the kind. Symbols with no signature (classes, interfaces, modules) fall back to a plain-name heading. Below: its `<DocumentationButtons>` relations (excluding "member of"), and a prose lead-in.

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
import { TreePage, DocumentationPage } from "shelving/ui";

<TreePage {...treeElement.props} />
<DocumentationPage {...documentationElement.props} />
```

To replace a renderer for one element type across the whole site, use `<TreePageMapping>` or `<TreeCardMapping>` from [ui/tree](/ui/tree).

## See also

- [ui/tree](/ui/tree) — `<TreeCards>` and the `*Mapping` override mechanism
- [extract](/extract) — produces the `TreeElement` tree whose props these renderers consume
- [markup](/markup) — renders the Markdown `content` field carried by each element

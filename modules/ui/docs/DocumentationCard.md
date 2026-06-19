# DocumentationCard

A compact link tile summarising a documented symbol — the default card renderer for `tree-documentation` elements in [`<TreeCards>`](/ui/TreeCards) directory listings. Each card links straight to the symbol's own page.

**Things to know:**

- It leads with the symbol's signature(s) via [`<DocumentationSignatures>`](/ui/DocumentationSignatures) (the same calm code blocks as [`<DocumentationPage>`](/ui/DocumentationPage)). The signature already carries the name (and `readonly` for properties), so there is no separate title or kind tag — the card's *colour* carries the kind. Symbols with no signature (classes, interfaces, modules) fall back to a plain-name heading.
- Below the heading it renders the symbol's [`<DocumentationButtons>`](/ui/DocumentationButtons) relations, then a prose lead-in. The `member of` relation is dropped — a member card almost always sits on its own class's page already.
- The card links to the element's stamped `path` (the canonical URL set by `flattenTree()` — see [`<TreeProvider>`](/ui/TreeProvider)).

## Usage

Used automatically via [`<TreeCards>`](/ui/TreeCards) (which [`<DocumentationPage>`](/ui/DocumentationPage) uses for its child sections). To render a single card manually, spread the element's flattened props.

```tsx
import { DocumentationCard } from "shelving/ui";

// `element` is a `tree-documentation` element from DirectoryExtractor (see /extract).
<DocumentationCard {...element.props} />
```

To replace this renderer across the whole site, wrap the app in [`TreeCardMapping`](/ui/TreeCards).

## Styling

`DocumentationCard` has no own CSS hooks — it composes [`<Card>`](/ui/Card), [`<Subheading>`](/ui/Subheading), and [`<Paragraph>`](/ui/Paragraph). The card is tinted by `kind` via [`<DocumentationKind>`](/ui/DocumentationKind)'s colour map; retheme through `Card`'s `--card-*` hooks.

# DocumentationButtons

Renders a documented symbol's relational metadata as a `<nav>` column of labelled links — `extends AbstractStore`, `implements Serializable`, `member of Store`. Used by both [`DocumentationPage`](/ui/DocumentationPage) (below the title) and [`DocumentationCard`](/ui/DocumentationCard).

**Things to know:**

- Each relation reads as `"{label} {Target}"`. The target is a [`TreeButton`](/ui/TreeButton), so it resolves the reference against the flattened tree map from [`TreeProvider`](/ui/TreeProvider): a hit becomes a link, a miss (e.g. a builtin like `Serializable`) renders as a plain non-linking label so the text still reads.
- Relations come from the raw metadata the extractor records — `extends` and `implements` first, then the broader `member of` (the `class` relation) last.
- It renders nothing when the symbol has no relations.
- Block spacing defaults to paragraph spacing (it composes [`getParagraphClass()`](/ui/getParagraphClass)); pass `space` to override. Inner spacing is the flex gap.
- Exported (plural) from `docs/DocumentationButtons.tsx`.

## Usage

Used automatically by [`DocumentationPage`](/ui/DocumentationPage) and [`DocumentationCard`](/ui/DocumentationCard). To render relations directly, pass the symbol's relational props.

```tsx
import { DocumentationButtons } from "shelving/ui";

<DocumentationButtons class="Store" extends="AbstractStore" implements={["Serializable"]} />
```

Drop a relation by omitting it, or tighten spacing with `space`.

```tsx
<DocumentationButtons extends="AbstractStore" space="none" />
```

## Styling

`DocumentationButtons` has no own CSS hooks — it composes [`getParagraphClass()`](/ui/getParagraphClass) for block spacing and the flex utilities for layout, and renders its links as [`TreeButton`](/ui/TreeButton)s. Retheme through those.

## See also

- [`DocumentationPage`](/ui/DocumentationPage) — renders these relations below the title.
- [`DocumentationCard`](/ui/DocumentationCard) — renders these relations inside the card (minus `member of`).
- [`TreeButton`](/ui/TreeButton) — resolves each reference to a link or plain label.
- [`TreeProvider`](/ui/TreeProvider) — provides the flattened tree map references are resolved against.

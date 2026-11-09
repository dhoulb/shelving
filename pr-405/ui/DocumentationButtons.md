# DocumentationButtons

- Kind: component
- Import: `import { DocumentationButtons } from "shelving/ui";`

Render a symbol's relational metadata as a `<nav>` column of labelled links.
- Each relation reads as `"{label} {Target}"` — e.g. `extends AbstractStore`, `implements Serializable`, `member of Store`.
- The target is a `<DocumentationButton>`, so it links to the referenced page when it exists in the tree and stays a plain label otherwise.
- Block spacing defaults to paragraph spacing (via `getParagraphClass()`); pass `space` to override. Inner spacing is the flex gap.
- Renders nothing when the symbol has no relations.

Renders a documented symbol's relational metadata as a `<nav>` column of labelled links — `extends AbstractStore`, `implements Serializable`, `member of Store`. Used by both `<DocumentationPage>` (below the title) and `<DocumentationCard>`.

**Things to know:**

- Each relation reads as `"{label} {Target}"`. The target is a `<TreeButton>`, so it resolves the reference against the flattened tree map from `<TreeProvider>`: a hit becomes a link, a miss (e.g. a builtin like `Serializable`) renders as a plain non-linking label so the text still reads.
- Relations come from the raw metadata the extractor records — `extends` and `implements` first, then the broader `member of` (the `class` relation) last.
- It renders nothing when the symbol has no relations.
- Block spacing defaults to paragraph spacing (it composes `getParagraphClass()`); pass `space` to override. Inner spacing is the flex gap.
- Exported (plural) from `docs/DocumentationButtons.tsx`.

## Usage

Used automatically by `<DocumentationPage>` and `<DocumentationCard>`. To render relations directly, pass the symbol's relational props.

```tsx
import { DocumentationButtons } from "shelving/ui";

<DocumentationButtons class="Store" extends="AbstractStore" implements={["Serializable"]} />
```

Drop a relation by omitting it, or tighten spacing with `space`.

```tsx
<DocumentationButtons extends="AbstractStore" space="none" />
```

## Styling

`DocumentationButtons` has no own CSS hooks — it composes `getParagraphClass()` for block spacing and the flex utilities for layout, and renders its links as `<TreeButton>`s. Retheme through those.


## Signatures

```ts
DocumentationButtons({
	space = "paragraph",
	wrap = true,
	left = true,
	gap = "none",
	className,
	...props
}: DocumentationButtonsProps): ReactElement | null
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DocumentationButtonsProps` |  |
| `.class` | `string \| undefined` | Name of the class/interface this member belongs to (e.g. `"Store"` for `Store.get()`). Set only on methods and properties. Read only. Optional. |
| `.extends` | `string \| undefined` | Full type text of the class/interface this extends, including any generic arguments (e.g. `"AbstractStore<string>"`, `"Omit<StringSchemaOptions, 'value'>"`). Resolved to a link at render time, trimming generics to the bare name; builtins/wrappers that don't resolve stay as text. Read only. Optional. |
| `.implements` | `ImmutableArray<string> \| undefined` | Full type text of the interfaces this implements, including generic arguments (e.g. `["Serializable<string>"]`). Resolved to links at render time (generics trimmed for lookup); builtins simply stay as text. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement \| null` |  |

# DocumentationCard

- Kind: component
- Import: `import { DocumentationCard } from "shelving/ui";`

Card renderer for a `tree-documentation` element — a compact summary card linking to the symbol's detail page.
- Leads with the symbol's signature(s) as calm code blocks (`<DocumentationSignatures>`, same as the detail page), which already carry the name; falls back to the bare name for symbols with no signature (classes, interfaces, modules).
- The card is tinted by `kind` (colour carries the method/property/etc. distinction — no separate tag).

A compact link tile summarising a documented symbol — the default card renderer for `tree-documentation` elements in `<TreeCards>` directory listings. Each card links straight to the symbol's own page.

**Things to know:**

- It leads with the symbol's signature(s) via `<DocumentationSignatures>` (the same calm code blocks as `<DocumentationPage>`). The signature already carries the name (and `readonly` for properties), so there is no separate title or kind tag — the card's *colour* carries the kind. Symbols with no signature (classes, interfaces, modules) fall back to a plain-name heading.
- Below the heading it renders the symbol's `<DocumentationButtons>` relations, then a prose lead-in. The `member of` relation is dropped — a member card almost always sits on its own class's page already.
- The card links to the element's stamped `path` (the canonical URL set by `flattenTree()` — see `<TreeProvider>`).

## Usage

Used automatically via `<TreeCards>` (which `<DocumentationPage>` uses for its child sections). To render a single card manually, spread the element's flattened props.

```tsx
import { DocumentationCard } from "shelving/ui";

// `element` is a `tree-documentation` element from DirectoryExtractor (see /extract).
<DocumentationCard {...element.props} />
```

To replace this renderer across the whole site, wrap the app in `TreeCardMapping`.

## Styling

`DocumentationCard` has no own CSS hooks — it composes `<Card>`, `<Subheading>`, and `<Paragraph>`. The card is tinted by `kind` via `<DocumentationKind>`'s colour map; retheme through `Card`'s `--card-*` hooks.


## Signatures

```ts
DocumentationCard({
	path,
	title,
	name,
	kind,
	description,
	signatures,
	// Drop `class` so cards omit the "member of" relation — a member card almost always sits on its own class's page already.
	class: _memberOf,
	...props
}: DocumentationElementProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DocumentationElementProps` |  |
| `.kind` | `string \| undefined` | Read only. Optional. |
| `.signatures` | `ImmutableArray<string> \| undefined` | Read only. Optional. |
| `.params` | `ImmutableArray<DocumentationParam> \| undefined` | Read only. Optional. |
| `.returns` | `ImmutableArray<DocumentationReturn> \| undefined` | Read only. Optional. |
| `.throws` | `ImmutableArray<DocumentationThrow> \| undefined` | Read only. Optional. |
| `.examples` | `ImmutableArray<DocumentationExample> \| undefined` | Read only. Optional. |
| `.class` | `string \| undefined` | Name of the class/interface this member belongs to (e.g. `"Store"` for `Store.get()`). Set only on methods and properties. Read only. Optional. |
| `.readonly` | `boolean \| undefined` | Whether the property is read-only — a `readonly` field, or a getter with no matching setter. Read only. Optional. |
| `.extends` | `string \| undefined` | Full type text of the class/interface this extends, including any generic arguments (e.g. `"AbstractStore<string>"`, `"Omit<StringSchemaOptions, 'value'>"`). Resolved to a link at render time, trimming generics to the bare name; builtins/wrappers that don't resolve stay as text. Read only. Optional. |
| `.implements` | `ImmutableArray<string> \| undefined` | Full type text of the interfaces this implements, including generic arguments (e.g. `["Serializable<string>"]`). Resolved to links at render time (generics trimmed for lookup); builtins simply stay as text. Read only. Optional. |
| `.types` | `ImmutableArray<string> \| undefined` | Type names referenced by a `type` alias's body (e.g. `["OtherType"]` for `type X = string \| OtherType`). - Raw identifier strings — resolved to links at render time; the alias's own generic parameters and primitive keywords are excluded, and unresolved names stay as plain text. Read only. Optional. |
| `.properties` | `ImmutableArray<DocumentationParam> \| undefined` | Structured data-member list for a `class`, `interface`, or object-literal `type` — each property's `name`, `type`, optionality, `default`, and `description`. Methods stay as child elements; only data members live here. - Reuses the `DocumentationParam` shape so it can both render the type's own Properties table and be flattened into an options-bag parameter's individual fields at render time. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |

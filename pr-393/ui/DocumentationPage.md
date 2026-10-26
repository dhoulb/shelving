# DocumentationPage

- Kind: component
- Import: `import { DocumentationPage } from "shelving/ui";`

Page renderer for a `tree-documentation` element — the full detail page for a documented symbol.
- Renders breadcrumbs, title (with kind + `readonly` tags), relational links (`member of`, `extends`, `implements`), signatures (one per overload), content, parameters, returns, throws, properties, referenced types, and examples.
- In the Parameters / Returns / Throws / Properties tables the `Type` column links each type to its documented page via `TreeLink` (exact-match only; compound or builtin types stay plain text), and a row with no hand-written description falls back to the referenced type's own `description`. A default renders as a `Defaults to …` note (linking the value when it's a documented token) rather than in a dedicated column.
- A class/interface/object-literal type's data members render as the Properties table (see `DocumentationProperties`); an options-bag parameter whose type resolves to one is flattened into indented child rows from the same structured list.
- A `type` alias's referenced type names render as a linked `Type` table, each row carrying the resolved element's `description` (exact-match only).
- Child symbols (functions, classes, methods — not data members) are grouped by `kind` into card sections, each under its own heading.
- All sections are conditional — only render when they have entries.

The full detail page for a documented symbol — the default renderer for `tree-documentation` elements dispatched by `<TreeApp>`. It is the most detailed page renderer in the tree shell; render it directly only when you need a symbol page outside the tree, or replace it for one element type via `TreePageMapping`.

**Things to know:**

- Above the title it renders an ancestor trail via `<TreeBreadcrumbs>`, so it needs a `<TreeProvider>` above it to resolve the ancestors.
- The title carries a `<DocumentationKind>` tag, and below it `<DocumentationButtons>` lists the symbol's relations (`member of`, `extends`, `implements`) as links.
- It renders the signature(s) via `<DocumentationSignatures>` (one block per overload, each carrying the symbol's name), then prose content, then conditional `Parameters` / `Returns` / `Throws` / `Examples` sections — each only appears when it has entries. Parameters render as a `<Table>` (`Param` / `Type` / `Default` / `Description` columns, a `-` standing in where a parameter has no default); Returns and Throws render as two-column tables (`Return` / `Throws` plus `Description`), with the type in the first column.
- Child symbols follow, grouped by `kind` into card sections (`Modules`, `Components`, `Functions`, `Classes`, `Interfaces`, `Types`, `Constants`, `Static methods`, `Methods`) rendered as `<DocumentationCard>`s inside a `<TreeCards>` listing. Data members (properties) are not child elements — they render as the Properties table instead. A new documented kind needs an entry in `KINDS` here (and a colour in `<DocumentationKind>`).

## Usage

Used automatically by `<TreeApp>`. To render a single page manually, spread the element's flattened props.

```tsx
import { DocumentationPage } from "shelving/ui";

// `element` is a `tree-documentation` element from DirectoryExtractor (see /extract).
<DocumentationPage {...element.props} />
```

To replace this renderer across the whole site, wrap the app in `TreePageMapping`.

```tsx
import { TreeApp, TreePageMapping } from "shelving/ui";

<TreePageMapping mapping={{ "tree-documentation": MyDocumentationPage }}>
  <TreeApp tree={tree} />
</TreePageMapping>
```

## Styling

`DocumentationPage` has no own CSS hooks — it composes `<Page>`, `<Panel>`, `<Section>`, and the other block components, which carry their own themeable surfaces. Retheme through those.


## Signatures

```ts
DocumentationPage({
	title,
	name,
	kind = "unknown",
	description,
	content,
	signatures,
	params,
	returns,
	throws,
	properties,
	types,
	examples,
	children,
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

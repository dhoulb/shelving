# DocumentationElementProps

- Kind: interface
- Import: `import { DocumentationElementProps } from "shelving/util/tree";`
- Extends: `TreeElementProps`

Props for a documented code symbol — a single shape for any kind of code element.
- `kind` distinguishes the symbol category (e.g. `"function"`, `"class"`, `"property"`, or any string).
- All props are optional — not every kind uses every prop (e.g. `returns` only makes sense for functions).
- `signatures` is an array so overloaded function/method declarations can each contribute their own signature to the same documentation element.

## Signatures

```ts
{
	readonly kind?: string | undefined;
	readonly signatures?: ImmutableArray<string> | undefined;
	readonly params?: ImmutableArray<DocumentationParam> | undefined;
	readonly returns?: ImmutableArray<DocumentationReturn> | undefined;
	readonly throws?: ImmutableArray<DocumentationThrow> | undefined;
	readonly examples?: ImmutableArray<DocumentationExample> | undefined;
	readonly class?: string | undefined;
	readonly readonly?: boolean | undefined;
	readonly extends?: string | undefined;
	readonly implements?: ImmutableArray<string> | undefined;
	readonly types?: ImmutableArray<string> | undefined;
	readonly properties?: ImmutableArray<DocumentationParam> | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `kind` | `string \| undefined` | Read only. Optional. |
| `signatures` | `ImmutableArray<string> \| undefined` | Read only. Optional. |
| `params` | `ImmutableArray<DocumentationParam> \| undefined` | Read only. Optional. |
| `returns` | `ImmutableArray<DocumentationReturn> \| undefined` | Read only. Optional. |
| `throws` | `ImmutableArray<DocumentationThrow> \| undefined` | Read only. Optional. |
| `examples` | `ImmutableArray<DocumentationExample> \| undefined` | Read only. Optional. |
| `class` | `string \| undefined` | Name of the class/interface this member belongs to (e.g. `"Store"` for `Store.get()`). Set only on methods and properties. Read only. Optional. |
| `readonly` | `boolean \| undefined` | Whether the property is read-only — a `readonly` field, or a getter with no matching setter. Read only. Optional. |
| `extends` | `string \| undefined` | Full type text of the class/interface this extends, including any generic arguments (e.g. `"AbstractStore<string>"`, `"Omit<StringSchemaOptions, 'value'>"`). Resolved to a link at render time, trimming generics to the bare name; builtins/wrappers that don't resolve stay as text. Read only. Optional. |
| `implements` | `ImmutableArray<string> \| undefined` | Full type text of the interfaces this implements, including generic arguments (e.g. `["Serializable<string>"]`). Resolved to links at render time (generics trimmed for lookup); builtins simply stay as text. Read only. Optional. |
| `types` | `ImmutableArray<string> \| undefined` | Type names referenced by a `type` alias's body (e.g. `["OtherType"]` for `type X = string \| OtherType`). - Raw identifier strings — resolved to links at render time; the alias's own generic parameters and primitive keywords are excluded, and unresolved names stay as plain text. Read only. Optional. |
| `properties` | `ImmutableArray<DocumentationParam> \| undefined` | Structured data-member list for a `class`, `interface`, or object-literal `type` — each property's `name`, `type`, optionality, `default`, and `description`. Methods stay as child elements; only data members live here. - Reuses the `DocumentationParam` shape so it can both render the type's own Properties table and be flattened into an options-bag parameter's individual fields at render time. Read only. Optional. |

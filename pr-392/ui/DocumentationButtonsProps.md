# DocumentationButtonsProps

- Kind: interface
- Import: `import { DocumentationButtonsProps } from "shelving/ui";`
- Extends: `BlockVariants`

Props for `DocumentationButtons` — the relational metadata of a documented symbol (`class`, `extends`, `implements`), plus block-space and flex overrides.

## Signatures

```ts
{
	readonly class?: string | undefined;
	readonly extends?: string | undefined;
	readonly implements?: ImmutableArray<string> | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `class` | `string \| undefined` | Name of the class/interface this member belongs to (e.g. `"Store"` for `Store.get()`). Set only on methods and properties. Read only. Optional. |
| `extends` | `string \| undefined` | Full type text of the class/interface this extends, including any generic arguments (e.g. `"AbstractStore<string>"`, `"Omit<StringSchemaOptions, 'value'>"`). Resolved to a link at render time, trimming generics to the bare name; builtins/wrappers that don't resolve stay as text. Read only. Optional. |
| `implements` | `ImmutableArray<string> \| undefined` | Full type text of the interfaces this implements, including generic arguments (e.g. `["Serializable<string>"]`). Resolved to links at render time (generics trimmed for lookup); builtins simply stay as text. Read only. Optional. |

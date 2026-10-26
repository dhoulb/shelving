# DictionarySchemaInput

- Kind: component
- Import: `import { DictionarySchemaInput } from "shelving/ui";`

Show a `DictionaryInput` for a `DictionarySchema`.

## Signatures

```ts
DictionarySchemaInput({ schema, value, ...props }: DictionarySchemaInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DictionarySchemaInputProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `DictionaryInput` element bound to the schema. |

## Examples

```ts
<DictionarySchemaInput name="meta" schema={META} />
```

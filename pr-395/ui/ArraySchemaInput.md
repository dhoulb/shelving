# ArraySchemaInput

- Kind: component
- Import: `import { ArraySchemaInput } from "shelving/ui";`

Show an `ArrayInput` for an `ArraySchema`.

## Signatures

```ts
ArraySchemaInput({ schema, value, ...props }: ArraySchemaInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ArraySchemaInputProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | An `ArrayInput` element bound to the schema. |

## Examples

```ts
<ArraySchemaInput name="tags" schema={TAGS} />
```

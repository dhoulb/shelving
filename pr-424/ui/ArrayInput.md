# ArrayInput

- Kind: component
- Import: `import { ArrayInput } from "shelving/ui";`

Repeating input that edits an array of items, adding a `SchemaInput` row per item.
- Each item is validated and rendered using the supplied `items` schema.
- Enforces `min`/`max` length and offers add, remove, and clear controls.

## Signatures

```ts
ArrayInput(props: ArrayInputProps<T>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ArrayInputProps<T>` |  |
| `.one` | `string` | Optional. |
| `.many` | `string` | Optional. |
| `.min` | `number \| undefined` | Optional. |
| `.max` | `number \| undefined` | Optional. |
| `.items` | `Schema<T>` | Schema for the items in the repeater. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | Element rendering one input row per array item plus add/clear controls. |

## Examples

```ts
<ArrayInput name="tags" items={STRING} value={tags} onValue={setTags} />
```

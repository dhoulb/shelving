# DictionaryInput

- Kind: component
- Import: `import { DictionaryInput } from "shelving/ui";`

Repeating input that edits a dictionary, with an editable key and schema-validated value per entry.
- Each value is validated and rendered using the supplied `items` schema.
- Enforces `min`/`max` entry count and offers add, remove, and clear controls.

## Signatures

```ts
DictionaryInput(props: DictionaryInputProps<T>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DictionaryInputProps<T>` |  |
| `.one` | `string` | Optional. |
| `.many` | `string` | Optional. |
| `.min` | `number \| undefined` | Optional. |
| `.max` | `number \| undefined` | Optional. |
| `.items` | `Schema<T>` | Schema for the items in the repeater. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | Element rendering one key/value row per entry plus add/clear controls. |

## Examples

```ts
<DictionaryInput name="meta" items={STRING} value={meta} onValue={setMeta} />
```

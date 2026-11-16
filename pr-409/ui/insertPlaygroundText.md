# insertPlaygroundText()

- Kind: function
- Import: `import { insertPlaygroundText } from "shelving/ui";`

Insert text on its own lines into playground code or CSS.
- With no `at`, CSS (text that ends with a `}`) gets the text before its last `}`, and other text gets it at the end.

## Signatures

```ts
insertPlaygroundText(text: string, insert: string, at?: number | undefined): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `text` | `string` | The code or CSS. |
| `insert` | `string` | The text to insert. |
| `at` | `number \| undefined` | The cursor position in `text`, e.g. the `selectionStart` of the text box. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The new text. |

## Examples

```ts
insertPlaygroundText("a\n", "b") // "a\nb\n"
```

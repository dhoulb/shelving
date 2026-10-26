# getElementText()

- Kind: function
- Import: `import { getElementText } from "shelving/util/element";`

Strip all tags from elements to produce a plain text string.
- A `<br>` element becomes a newline (`\n`) — matching DOM `innerText`, so words either side of a line break don't fuse together.

## Signatures

```ts
getElementText(elements: Elements): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `elements` | `Elements` | An element, a plain string, or null/undefined (or an array of those things). |

## Returns

| Type | Description |
| --- | --- |
| `string` | The combined string made from the elements. |

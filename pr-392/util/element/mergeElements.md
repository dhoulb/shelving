# mergeElements()

- Kind: function
- Import: `import { mergeElements } from "shelving/util/element";`

Combine two `Elements`, preserving both if both are set.
- If either side is falsy the other side is returned unchanged.

## Signatures

```ts
mergeElements(a: Elements<T>, b: Elements<T>): Elements<T>
mergeElements(a: Elements, b: Elements): Elements
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `a` | `Elements<T>` | The first elements. |
| `b` | `Elements<T>` | The second elements. |
| `a` | `Elements` |  |
| `b` | `Elements` |  |

## Returns

| Type | Description |
| --- | --- |
| `Elements<T>` | The combined `Elements`, or whichever side is set if the other is falsy. |
| `Elements` |  |

# getArray()

- Kind: function
- Import: `import { getArray } from "shelving/util/array";`

Convert a possible array to an array.

## Signatures

```ts
getArray(list: unknown): ImmutableArray<unknown> | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `list` | `unknown` | The value to convert (an array is returned as-is, an iterable is collected into a new array). |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<unknown> \| undefined` | An array of the items, or `undefined` if `list` could not be converted. |

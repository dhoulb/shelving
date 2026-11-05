# notInArray()

- Kind: function
- Import: `import { notInArray } from "shelving/util/equal";`

Is unknown value `left` not in array `right`?

## Signatures

```ts
notInArray(left: unknown, right: ImmutableArray): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `unknown` | The value to look for. |
| `right` | `ImmutableArray` | The array to search within. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if `left` is not an item of `right`. |

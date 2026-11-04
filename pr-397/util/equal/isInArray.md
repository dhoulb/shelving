# isInArray()

- Kind: function
- Import: `import { isInArray } from "shelving/util/equal";`

Is unknown value `left` in array `right`?

## Signatures

```ts
isInArray(left: unknown, right: ImmutableArray<R>): left is R
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `unknown` | The value to look for and narrow. |
| `right` | `ImmutableArray<R>` | The array to search within. |

## Returns

| Type | Description |
| --- | --- |
| `left is R` | `true` if `left` is an item of `right`. |

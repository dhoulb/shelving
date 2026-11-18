# isArrayWith()

- Kind: function
- Import: `import { isArrayWith } from "shelving/util/equal";`

Is unknown value `left` an array that includes `right`?

## Signatures

```ts
isArrayWith(left: unknown, right: T): left is ImmutableArray<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `unknown` | The value to check and narrow. |
| `right` | `T` | The item the array must include. |

## Returns

| Type | Description |
| --- | --- |
| `left is ImmutableArray<T>` | `true` if `left` is an array containing `right`. |

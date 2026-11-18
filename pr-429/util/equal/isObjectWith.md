# isObjectWith()

- Kind: function
- Import: `import { isObjectWith } from "shelving/util/equal";`

Is unknown value `left` an object with every prop from `right`?

## Signatures

```ts
isObjectWith(left: unknown, right: ImmutableObject): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `unknown` | The value to check. |
| `right` | `ImmutableObject` | The object whose props `left` must contain. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if `left` is an object containing every prop of `right`. |

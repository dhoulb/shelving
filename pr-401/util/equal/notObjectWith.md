# notObjectWith()

- Kind: function
- Import: `import { notObjectWith } from "shelving/util/equal";`

Is unknown value `left` not an object or missing one or more props from `right`?

## Signatures

```ts
notObjectWith(left: unknown, right: ImmutableObject): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `unknown` | The value to check. |
| `right` | `ImmutableObject` | The object whose props `left` must contain. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if `left` is not an object or is missing one or more props of `right`. |

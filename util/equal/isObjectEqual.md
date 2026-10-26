# isObjectEqual()

- Kind: function
- Import: `import { isObjectEqual } from "shelving/util/equal";`

Are two objects equal based on their own props?
- `left` must have every property present in `right`
- `left` must not have excess properties not present in `right`

## Signatures

```ts
isObjectEqual(left: ImmutableObject, right: T, recursor: Match = isEqual): left is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `ImmutableObject` | The object to check and narrow. |
| `right` | `T` | The object to compare against. |
| `recursor` | `Match` | Function that checks each prop of the object. - Defaults to `isEqual()` to check strict equality of the properties. - Use `isDeepEqual()` as the recursor to check to check deep equality of the properties. Defaults to `isEqual`. |

## Returns

| Type | Description |
| --- | --- |
| `left is T` | `true` if both objects have exactly the same own props and matching values. |

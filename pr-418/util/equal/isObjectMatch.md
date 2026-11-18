# isObjectMatch()

- Kind: function
- Import: `import { isObjectMatch } from "shelving/util/equal";`

Are two objects partially equal based on their own props?
- `left` must have every property present in `right`
- `left` may have have excess properties not present in `right`

## Signatures

```ts
isObjectMatch(left: L | R, right: R, recursor: Match = isEqual): left is L & R
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `L \| R` | The object to check and narrow. |
| `right` | `R` | The object whose props `left` must contain. |
| `recursor` | `Match` | Function that checks each prop of the object. - Defaults to `isEqual()` to check strict equality of the properties. - Use `isDeepEqual()` as the recursor to check to check deep equality of the properties. Defaults to `isEqual`. |

## Returns

| Type | Description |
| --- | --- |
| `left is L & R` | `true` if `left` contains every prop of `right` with matching values. |

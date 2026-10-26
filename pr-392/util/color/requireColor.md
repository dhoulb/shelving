# requireColor()

- Kind: function
- Import: `import { requireColor } from "shelving/util/color";`

Convert a possible color to a `Color` instance, or throw `RequiredError` if it can't be converted.

## Signatures

```ts
requireColor(value: PossibleColor, caller: AnyCaller = requireColor): Color
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PossibleColor` | The possible color to convert. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireColor` itself). Defaults to `requireColor`. |

## Returns

| Type | Description |
| --- | --- |
| `Color` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` cannot be converted to a `Color`. |

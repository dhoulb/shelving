# isFuture()

- Kind: function
- Import: `import { isFuture } from "shelving/util/duration";`

Is a date in the future?

## Signatures

```ts
isFuture(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = isFuture): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to test. |
| `current` | `PossibleDate` | Date to test against (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `isFuture` itself). Defaults to `isFuture`. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if `target` is after `current`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |

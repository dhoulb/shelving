# isPast()

- Kind: function
- Import: `import { isPast } from "shelving/util/duration";`

Is a date in the past?

## Signatures

```ts
isPast(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = isPast): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date to test. |
| `current` | `PossibleDate` | Date to test against (defaults to now). Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `isPast` itself). Defaults to `isPast`. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if `target` is before `current`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |

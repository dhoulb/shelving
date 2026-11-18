# getUntil()

- Kind: function
- Import: `import { getUntil } from "shelving/util/duration";`

Get the various time units until a certain date.

## Signatures

```ts
getUntil(target: PossibleDate, current: PossibleDate = "now", caller: AnyCaller = getUntil): DurationData
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date the duration counts up to. |
| `current` | `PossibleDate` | Date the duration counts from (defaults to now). Defaults to `"now"`. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getUntil` itself). Defaults to `getUntil`. |

## Returns

| Type | Description |
| --- | --- |
| `DurationData` | `DurationData` object for the span from `current` to `target`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |

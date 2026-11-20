# getAgo()

- Kind: function
- Import: `import { getAgo } from "shelving/util/duration";`

Get the various time units since a certain date.

## Signatures

```ts
getAgo(target: PossibleDate, current: PossibleDate = "now", caller: AnyCaller = getAgo): DurationData
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate` | Date the duration counts back from. |
| `current` | `PossibleDate` | Date the duration counts to (defaults to now). Defaults to `"now"`. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getAgo` itself). Defaults to `getAgo`. |

## Returns

| Type | Description |
| --- | --- |
| `DurationData` | `DurationData` object for the span from `target` to `current`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `current` cannot be converted to a valid date. |

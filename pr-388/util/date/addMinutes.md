# addMinutes()

- Kind: function
- Import: `import { addMinutes } from "shelving/util/date";`

Return a new date that increase or decreases the minute based on an input date.

## Signatures

```ts
addMinutes(change: number, target?: PossibleDate, caller: AnyCaller = addMinutes): Date
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `change` | `number` |  |
| `target` | `PossibleDate` | Optional. |
| `caller` | `AnyCaller` | Defaults to `addMinutes`. |

## Returns

| Type | Description |
| --- | --- |
| `Date` |  |

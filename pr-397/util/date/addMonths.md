# addMonths()

- Kind: function
- Import: `import { addMonths } from "shelving/util/date";`

Return a new date that increase or decreases the month based on an input date.
- Note that with Javascript "rollover" semantics, adding a month when we're on e.g. 31st of August would normally roll _past_ September and return 1st October.
- To avoid this we clamp the date to the end of the month if rollover happens.

## Signatures

```ts
addMonths(change: number, target?: PossibleDate, caller: AnyCaller = addMonths): Date
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `change` | `number` |  |
| `target` | `PossibleDate` | Optional. |
| `caller` | `AnyCaller` | Defaults to `addMonths`. |

## Returns

| Type | Description |
| --- | --- |
| `Date` |  |

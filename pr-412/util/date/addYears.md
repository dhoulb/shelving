# addYears()

- Kind: function
- Import: `import { addYears } from "shelving/util/date";`

Return a new date that increase or decreases the month based on an input date.
- February 29th is a special cased and is _rounded down_ to February 28th on non-leap years.

## Signatures

```ts
addYears(change: number, target?: PossibleDate, caller: AnyCaller = addYears): Date
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `change` | `number` |  |
| `target` | `PossibleDate` | Optional. |
| `caller` | `AnyCaller` | Defaults to `addYears`. |

## Returns

| Type | Description |
| --- | --- |
| `Date` |  |

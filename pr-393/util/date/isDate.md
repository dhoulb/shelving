# isDate()

- Kind: function
- Import: `import { isDate } from "shelving/util/date";`

Is a value a valid `Date` instance?
- Note: `Date` instances can be invalid (e.g. `new Date("blah blah").getTime()` returns `NaN`). These are detected and will always return `false`

## Signatures

```ts
isDate(value: unknown): value is Date
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

## Returns

| Type | Description |
| --- | --- |
| `value is Date` | `true` if the value is a `Date` instance representing a valid date, narrowing it to `Date`. |

# DateInput()

- Kind: function
- Import: `import { DateInput } from "shelving/ui";`

Date, time, or datetime input that accepts a `PossibleDate` and emits an ISO string value.
- The `input` prop selects the underlying `<input type="date|time|datetime-local">` and matching string format.

## Signatures

```ts
DateInput({
	name,
	title = "",
	placeholder = title, // Placeholder must be defined or `:placeholder-shown` CSS rules won't show.
	required = false,
	disabled = false,
	message = "",
	value,
	onValue,
	min,
	max,
	input = "date",
	step,
	className,
	...variants
}: DateInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variants` | `DateInputProps` |  |
| `.min` | `PossibleDate \| undefined` | Optional. |
| `.max` | `PossibleDate \| undefined` | Optional. |
| `.input` | `DateInputType \| undefined` | Optional. |
| `.step` | `number \| undefined` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A native date/time `<input>` element. |

## Examples

```ts
<DateInput name="dob" input="date" value={dob} onValue={setDob} />
```

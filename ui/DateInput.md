# DateInput

- Kind: component
- Import: `import { DateInput } from "shelving/ui";`

Date, time, or datetime input that accepts a `PossibleDate` and emits an ISO string value.
- The `input` prop selects the underlying `<input type="date|time|datetime-local">` and matching string format.

A date, time, or date and time input. Renders the browser's own `<input type="date">`, `"time"` or `"datetime-local"`.

**Things to know:**

- `input` sets the type: `"date"` (the default), `"time"` or `"datetime-local"`.
- `value`, `min` and `max` accept any `PossibleDate`: a `Date`, a timestamp, or a date string.
- `onValue()` gets a string in the format of the type: `YYYY-MM-DD` for a date, `HH:MM` or `HH:MM:SS` for a time, and `YYYY-MM-DDTHH:MM` for a date and time (with no time zone).
- `step` sets the step in seconds for a time.
- The browser draws the picker, so it looks different in each browser.
- In a `<Form>`, a `DateSchema` makes this input for you.

## Usage

```tsx live
import { DateInput } from "shelving/ui";

<DateInput name="start" title="Start date" value={new Date()} onValue={() => {}} />
<DateInput name="time" input="time" title="Time" value="09:30" onValue={() => {}} />
<DateInput name="when" input="datetime-local" title="Date and time" onValue={() => {}} />
```

### Minimum and maximum

```tsx live
import { DateInput } from "shelving/ui";

// Only dates in 2027 can be picked.
<DateInput name="trip" title="Trip date" min="2027-01-01" max="2027-12-31" onValue={() => {}} />;
```

## Styling

`DateInput` uses the shared input styles. See `getInputClass()` for the `--input-*` hooks.


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

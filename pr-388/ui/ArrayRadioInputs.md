# ArrayRadioInputs()

- Kind: function
- Import: `import { ArrayRadioInputs } from "shelving/ui";`

Output a list of `<RadioInput>` elements for each item in an array.
- The items can be any type, and can be formatted for output through an optional `formatter()` function.
- A `placeholder` option is shown at the bottom if `required=false`.

## Signatures

```ts
ArrayRadioInputs({
	value,
	onValue,
	required = false,
	items,
	formatter = formatValue,
	className,
	...props
}: ArrayRadioInputsProps<T>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ArrayRadioInputsProps<T>` |  |
| `.items` | `ImmutableArray<T>` | Array of values to show in the list of radios. |
| `.formatter` | `((value: T) => ReactNode) \| undefined` | Function that formats an obscure item into a `ReactNode` for display. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | Element rendering one radio per item plus an optional empty placeholder radio. |

## Examples

```ts
<ArrayRadioInputs name="size" items={["s", "m", "l"]} value={size} onValue={setSize} />
```

# ArrayCheckboxInputs

- Kind: component
- Import: `import { ArrayCheckboxInputs } from "shelving/ui";`

Output a list of `<CheckboxInput>` elements for each item in an array, to pick any number of them.
- The value is the array of checked items, in the order they were checked. Items are compared with `===`.
- Checked items that are not in `items` stay in the value.
- The items can be any type, and can be formatted for output through an optional `formatter()` function.

## Signatures

```ts
ArrayCheckboxInputs({
	value = [],
	onValue,
	required = false,
	items,
	formatter = formatValue,
	className,
	...props
}: ArrayCheckboxInputsProps<T>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ArrayCheckboxInputsProps<T>` |  |
| `.items` | `ImmutableArray<T>` | Array of values to show in the list of checkboxes. |
| `.formatter` | `((value: T) => ReactNode) \| undefined` | Function that formats an obscure item into a `ReactNode` for display. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | Element rendering one checkbox per item. |

## Examples

```ts
<ArrayCheckboxInputs name="sizes" items={["s", "m", "l"]} value={sizes} onValue={setSizes} />
```

# ArrayCheckboxInputsProps

- Kind: interface
- Import: `import { ArrayCheckboxInputsProps } from "shelving/ui";`
- Extends: `ValueInputProps<ImmutableArray<T>>`

Props for `ArrayCheckboxInputs`, which renders a checkbox for each item in an array of values.

## Signatures

```ts
{
	items: ImmutableArray<T>;
	formatter?: ((value: T) => ReactNode) | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `items` | `ImmutableArray<T>` | Array of values to show in the list of checkboxes. |
| `formatter` | `((value: T) => ReactNode) \| undefined` | Function that formats an obscure item into a `ReactNode` for display. Optional. |

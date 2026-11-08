# ArrayRadioInputsProps

- Kind: interface
- Import: `import { ArrayRadioInputsProps } from "shelving/ui";`
- Extends: `ValueInputProps<T>`

Props for `ArrayRadioInputs`, which renders a radio for each item in an array of values.

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
| `items` | `ImmutableArray<T>` | Array of values to show in the list of radios. |
| `formatter` | `((value: T) => ReactNode) \| undefined` | Function that formats an obscure item into a `ReactNode` for display. Optional. |

# ChoiceRadioInputsProps

- Kind: interface
- Import: `import { ChoiceRadioInputsProps } from "shelving/ui";`
- Extends: `ValueInputProps<T>`

Props for `ChoiceRadioInputs`, which renders a radio for each entry in a `ChoiceOptions` set.

## Signatures

```ts
{
	options: ChoiceOptions<T>;
	wrap?: boolean;
	column?: boolean;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `options` | `ChoiceOptions<T>` | Options for the radios. |
| `wrap` | `boolean` | Wrap the radios onto multiple rows if needed. Optional. |
| `column` | `boolean` | Display the radios in a column rather than a row. Optional. |

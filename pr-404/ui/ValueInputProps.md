# ValueInputProps

- Kind: interface
- Import: `import { ValueInputProps } from "shelving/ui";`
- Extends: `InputProps`

"Value inputs" are inputs that generate a value, like `<input>` or `<textarea>`

## Signatures

```ts
{
	value?: O | I | undefined;
	onValue(value: O | undefined): void;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `value` | `O \| I \| undefined` | The current value of the input. Optional. |

## Methods

- [ValueInputProps.onValue()](ValueInputProps/onValue.md): Called when the value for the input changes, so you can make changes based on the new value (or undefined to set back to default).

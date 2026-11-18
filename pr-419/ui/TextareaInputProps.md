# TextareaInputProps

- Kind: interface
- Import: `import { TextareaInputProps } from "shelving/ui";`
- Extends: `ValueInputProps<string>`

Props for `TextareaInput`, a multiline text input bound to a `string` value.

## Signatures

```ts
{
	rows?: number | undefined;
	min?: number | undefined;
	max?: number | undefined;
	formatter?: TextFormatter | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `rows` | `number \| undefined` | Rows the textarea shows at first (its minimum height). It grows to fit its content. Defaults to `2`. |
| `min` | `number \| undefined` | Optional. |
| `max` | `number \| undefined` | Optional. |
| `formatter` | `TextFormatter \| undefined` | Optional formatter — when provided the value is reformatted on blur and when initially displayed (the value published through `onValue` is never formatted). Optional. |

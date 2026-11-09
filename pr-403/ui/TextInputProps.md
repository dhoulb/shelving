# TextInputProps

- Kind: interface
- Import: `import { TextInputProps } from "shelving/ui";`
- Extends: `ValueInputProps<string>`

Props for `TextInput`, a single-line text input bound to a `string` value.

## Signatures

```ts
{
	input?: StringInputType;
	min?: number | undefined;
	max?: number | undefined;
	formatter?: TextFormatter | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `input` | `StringInputType` | Optional. |
| `min` | `number \| undefined` | Optional. |
| `max` | `number \| undefined` | Optional. |
| `formatter` | `TextFormatter \| undefined` | Optional formatter — when provided the value is reformatted on blur and when initially displayed (the value published through `onValue` is never formatted). Optional. |

# NumberInputProps

- Kind: interface
- Import: `import { NumberInputProps } from "shelving/ui";`
- Extends: `ValueInputProps<number>`

Props for `NumberInput`, a text-based numeric input bound to a `number` value.

## Signatures

```ts
{
	min?: number | undefined;
	max?: number | undefined;
	formatter?: NumberFormatter | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `min` | `number \| undefined` | Optional. |
| `max` | `number \| undefined` | Optional. |
| `formatter` | `NumberFormatter \| undefined` | Optional formatter — when provided the input switches to `type="text"` and reformats the value on blur. Optional. |

# DateInputProps

- Kind: interface
- Import: `import { DateInputProps } from "shelving/ui";`
- Extends: `ValueInputProps<string, PossibleDate>`

Props for `DateInput`, a date/time `<input>` that emits an ISO string value.

## Signatures

```ts
{
	min?: PossibleDate | undefined;
	max?: PossibleDate | undefined;
	input?: DateInputType | undefined;
	step?: number | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `min` | `PossibleDate \| undefined` | Optional. |
| `max` | `PossibleDate \| undefined` | Optional. |
| `input` | `DateInputType \| undefined` | Optional. |
| `step` | `number \| undefined` | Optional. |

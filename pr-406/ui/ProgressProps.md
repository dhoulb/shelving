# ProgressProps

- Kind: interface
- Import: `import { ProgressProps } from "shelving/ui";`
- Extends: `ColorVariants`

Props for `Progress`, a continuous horizontal progress bar.

## Signatures

```ts
{
	value?: Nullish<number>;
	min?: number;
	max?: number;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `value` | `Nullish<number>` | Position within the `min`–`max` range, or `null`/`undefined`/omitted for an indeterminate bar. Optional. |
| `min` | `number` | Optional. |
| `max` | `number` | Optional. |

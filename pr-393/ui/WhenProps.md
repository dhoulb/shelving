# WhenProps

- Kind: interface
- Import: `import { WhenProps } from "shelving/ui";`
- Extends: `OptionalChildProps`

Props for `When`, `Ago`, and `Until` — a `target` date plus an optional `current` reference date and `full` toggle.
- Unit format options go straight on the props, e.g. `<Ago target={when} unitDisplay="short" />`. `unitDisplay` defaults to `"narrow"` (e.g. `3h`).

## Signatures

```ts
{
	target: PossibleDate | undefined;
	current?: PossibleDate | undefined;
	full?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `target` | `PossibleDate \| undefined` |  |
| `current` | `PossibleDate \| undefined` | Reference date the relative time is measured against. Defaults to `"now"`. |
| `full` | `boolean \| undefined` | Optional. |

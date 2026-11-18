# PlaygroundVariable

- Kind: interface
- Import: `import { PlaygroundVariable } from "shelving/ui";`

One CSS variable that you can set to change the look of shelving components.

## Signatures

```ts
{
	readonly name: string;
	readonly value: string;
	readonly description?: string | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | Name of the variable, e.g. `"--card-background"`. Read only. |
| `value` | `string` | Default value of the variable, e.g. `"var(--tint-90)"`. Read only. |
| `description` | `string \| undefined` | What the variable styles, e.g. `"Surface fill"`. Read only. Optional. |

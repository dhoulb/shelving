# PlaygroundVariableGroup

- Kind: interface
- Import: `import { PlaygroundVariableGroup } from "shelving/ui";`

A group of CSS variables that one CSS module owns, e.g. the `--card-*` variables of `Card.module.css`.

## Signatures

```ts
{
	readonly name: string;
	readonly tokens?: boolean | undefined;
	readonly variables: readonly PlaygroundVariable[];
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | Name of the group, e.g. `"Card"`. Read only. |
| `tokens` | `boolean \| undefined` | Whether the group holds global design tokens (from the `style/` modules), not hooks for one component. Read only. Optional. |
| `variables` | `readonly PlaygroundVariable[]` | The variables in the group. Read only. |

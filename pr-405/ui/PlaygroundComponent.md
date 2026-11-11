# PlaygroundComponent

- Kind: interface
- Import: `import { PlaygroundComponent } from "shelving/ui";`

One shelving component that you can insert into the playground code.

## Signatures

```ts
{
	readonly name: string;
	readonly group: string;
	readonly description?: string | undefined;
	readonly snippet: string;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | Name of the component, e.g. `"Button"`. Read only. |
| `group` | `string` | Name of the group the component is in, e.g. `"block"` or `"form"`. Read only. |
| `description` | `string \| undefined` | First line of the component's docblock. Read only. Optional. |
| `snippet` | `string` | TSX to insert, with its imports, e.g. `import { Button } from "shelving/ui";\n\n<Button>Save</Button>`. Read only. |

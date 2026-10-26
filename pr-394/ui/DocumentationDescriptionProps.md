# DocumentationDescriptionProps

- Kind: interface
- Import: `import { DocumentationDescriptionProps } from "shelving/ui";`

Props for `DocumentationDescription` — a description cell's resolved text, plus an optional default/optionality note.

## Signatures

```ts
{
	readonly description?: string | undefined;
	readonly default?: string | undefined;
	readonly optional?: boolean | undefined;
	readonly readonly?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `description` | `string \| undefined` | Already-resolved description text (hand-written, or fallen back to the referenced type's own description), rendered as inline markup. Read only. Optional. |
| `default` | `string \| undefined` | Default-value expression — rendered as a trailing `Defaults to …` note (linked when it's a documented token). Read only. Optional. |
| `optional` | `boolean \| undefined` | Whether the value is optional — pass an explicit boolean to opt into the note: `false` appends `Required.` (when there's no default), `true` appends nothing. Leave `undefined` to suppress the note entirely (e.g. for returns/throws). Read only. Optional. |
| `readonly` | `boolean \| undefined` | Whether the value is read-only — appends a trailing `Readonly` note at the very end (after any `Defaults to …` / `Required.`). Read only. Optional. |

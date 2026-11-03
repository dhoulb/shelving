# ChoiceSchemaOptions

- Kind: interface
- Import: `import { ChoiceSchemaOptions } from "shelving/schema";`
- Extends: `SchemaOptions`

Options for `ChoiceSchema`.

- `options` — the allowed choices, as a `{ key: title }` dictionary or an array of keys.
- `value` — default option used when the input is `undefined`.
- `input` — control hint for downstream UIs (radios or a select).

## Signatures

```ts
{
	readonly options: PossibleChoiceOptions<O>;
	readonly value?: O | I;
	readonly input?: ChoiceInputType | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `options` | `PossibleChoiceOptions<O>` | Specify correct options using a dictionary of entries. Read only. |
| `value` | `O \| I` | Default option for the value. Read only. Optional. |
| `input` | `ChoiceInputType \| undefined` | Input control hint for downstream UIs. Read only. Defaults to `"radio" for 8 or fewer options, otherwise "select"`. |

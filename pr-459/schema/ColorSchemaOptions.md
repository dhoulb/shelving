# ColorSchemaOptions

- Kind: interface
- Import: `import { ColorSchemaOptions } from "shelving/schema";`
- Extends: `SchemaOptions`

Options for a `ColorSchema`.

- The length, format, and single-line constraints are fixed internally, so only the presentation-level string options are exposed.

## Signatures

```ts
{
	readonly value?: string | undefined;
	readonly max?: number | undefined;
	readonly case?: "upper" | "lower" | undefined;
	readonly input?: StringInputType | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `value` | `string \| undefined` | Default hex value used when the input is `undefined`. Read only. Defaults to `"#000000"`. |
| `max` | `number \| undefined` | Maximum allowed character length. Read only. Defaults to `7`. |
| `case` | `"upper" \| "lower" \| undefined` | Force the result to `"upper"` or `"lower"` case. Read only. Optional. |
| `input` | `StringInputType \| undefined` | HTML `<input />` `type=""` hint for downstream UIs. Read only. Defaults to `"color"`. |

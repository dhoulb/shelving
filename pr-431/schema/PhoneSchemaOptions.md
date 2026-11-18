# PhoneSchemaOptions

- Kind: interface
- Import: `import { PhoneSchemaOptions } from "shelving/schema";`
- Extends: `SchemaOptions`

Options for a `PhoneSchema`.

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
| `value` | `string \| undefined` | Default string value used when the input is `undefined`. Read only. Optional. |
| `max` | `number \| undefined` | Maximum allowed character length. Read only. Defaults to `16`. |
| `case` | `"upper" \| "lower" \| undefined` | Force the result to `"upper"` or `"lower"` case. Read only. Optional. |
| `input` | `StringInputType \| undefined` | HTML `<input />` `type=""` hint for downstream UIs. Read only. Defaults to `"tel"`. |

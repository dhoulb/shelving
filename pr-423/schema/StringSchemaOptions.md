# StringSchemaOptions

- Kind: interface
- Import: `import { StringSchemaOptions } from "shelving/schema";`
- Extends: `SchemaOptions`

Options for `StringSchema`.

## Signatures

```ts
{
	readonly value?: string | undefined;
	readonly min?: number | undefined;
	readonly max?: number | undefined;
	readonly multiline?: boolean | undefined;
	readonly rows?: number | undefined;
	readonly match?: RegExp | undefined;
	readonly case?: "upper" | "lower" | undefined;
	readonly input?: StringInputType | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `value` | `string \| undefined` | Default string value used when the input is `undefined`. Read only. Defaults to `""`. |
| `min` | `number \| undefined` | Minimum allowed character length. Read only. Defaults to `0`. |
| `max` | `number \| undefined` | Maximum allowed character length. Read only. Defaults to `Number.POSITIVE_INFINITY`. |
| `multiline` | `boolean \| undefined` | Whether the string keeps line breaks (multiline sanitization). An input for it is a `<textarea>` that grows. Read only. Defaults to `false`. |
| `rows` | `number \| undefined` | Rows a multiline input shows at first. Set `1` for a box that starts one line high, like a chat message. Single-line inputs ignore it. Read only. Defaults to `` `2` when `multiline`, else `1` ``. |
| `match` | `RegExp \| undefined` | Regular expression the sanitized string must match. Read only. Optional. |
| `case` | `"upper" \| "lower" \| undefined` | Force the result to `"upper"` or `"lower"` case. Read only. Optional. |
| `input` | `StringInputType \| undefined` | HTML `<input />` `type=""` hint for downstream UIs. Read only. Defaults to `"text"`. |

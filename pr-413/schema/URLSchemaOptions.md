# URLSchemaOptions

- Kind: interface
- Import: `import { URLSchemaOptions } from "shelving/schema";`
- Extends: `SchemaOptions`

Options for `URLSchema`.

- The length and single-line constraints are fixed internally, so only the presentation-level string options plus `base` and `schemes` are exposed.

## Signatures

```ts
{
	readonly value?: string | undefined;
	readonly max?: number | undefined;
	readonly match?: RegExp | undefined;
	readonly case?: "upper" | "lower" | undefined;
	readonly input?: StringInputType | undefined;
	readonly base?: URL | URLString | undefined;
	readonly schemes?: URISchemes | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `value` | `string \| undefined` | Default string value used when the input is `undefined`. Read only. Optional. |
| `max` | `number \| undefined` | Maximum allowed character length. Read only. Defaults to `512`. |
| `match` | `RegExp \| undefined` | Regular expression the sanitized string must match. Read only. Optional. |
| `case` | `"upper" \| "lower" \| undefined` | Force the result to `"upper"` or `"lower"` case. Read only. Optional. |
| `input` | `StringInputType \| undefined` | HTML `<input />` `type=""` hint for downstream UIs. Read only. Defaults to `"url"`. |
| `base` | `URL \| URLString \| undefined` | Base URL that relative URLs are resolved against. Read only. Optional. |
| `schemes` | `URISchemes \| undefined` | Whitelist of allowed URL schemes. Read only. Defaults to `HTTP_SCHEMES`. |

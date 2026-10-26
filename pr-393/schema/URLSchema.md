# URLSchema

- Kind: class
- Import: `import { URLSchema } from "shelving/schema";`
- Extends: `StringSchema`

Schema that defines a valid absolute or relative URL string.

- Checks the URL scheme against a whitelist (always), and resolves relative URLs against `base` when set.
- URLs are limited to 512 characters, but generally these won't be `data:` URIs so this is a reasonable limit.

## Signatures

```ts
new URLSchema({ one = "URL", title = "URL", base, schemes = HTTP_SCHEMES, input = "url", max = 512, ...options }: URLSchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `URLSchemaOptions` |  |
| `.value` | `string \| undefined` | Default string value used when the input is `undefined`. Read only. Optional. |
| `.max` | `number \| undefined` | Maximum allowed character length. Read only. Defaults to `512`. |
| `.match` | `RegExp \| undefined` | Regular expression the sanitized string must match. Read only. Optional. |
| `.case` | `"upper" \| "lower" \| undefined` | Force the result to `"upper"` or `"lower"` case. Read only. Optional. |
| `.input` | `StringInputType \| undefined` | HTML `<input />` `type=""` hint for downstream UIs. Read only. Defaults to `"url"`. |
| `.base` | `URL \| URLString \| undefined` | Base URL that relative URLs are resolved against. Read only. Optional. |
| `.schemes` | `URISchemes \| undefined` | Whitelist of allowed URL schemes. Read only. Defaults to `HTTP_SCHEMES`. |

## Returns

| Type | Description |
| --- | --- |
| `URLSchema` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `base` | `URLString \| undefined` | Base URL that relative URLs are resolved against, or `undefined` when not set. Read only. |
| `schemes` | `URISchemes` | Whitelist of allowed URL schemes, e.g. `["https:", "http:"]`. Read only. |

## Examples

```ts
const schema = new URLSchema({ base: "https://example.com" });
	schema.validate("/page") // "https://example.com/page"
```

# URISchema

- Kind: class
- Import: `import { URISchema } from "shelving/schema";`
- Extends: `StringSchema`

Schema that defines a valid absolute URI string.

- Checks the URI scheme against a whitelist (always).
- URIs are limited to 512 characters, but generally these won't be `data:` URIs so this is a reasonable limit.

## Signatures

```ts
new URISchema({ one = "URI", title = "URI", schemes = HTTP_SCHEMES, input = "url", max = 512, ...options }: URISchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `URISchemaOptions` |  |
| `.value` | `string \| undefined` | Default string value used when the input is `undefined`. Read only. Optional. |
| `.max` | `number \| undefined` | Maximum allowed character length. Read only. Defaults to `512`. |
| `.match` | `RegExp \| undefined` | Regular expression the sanitized string must match. Read only. Optional. |
| `.case` | `"upper" \| "lower" \| undefined` | Force the result to `"upper"` or `"lower"` case. Read only. Optional. |
| `.input` | `StringInputType \| undefined` | HTML `<input />` `type=""` hint for downstream UIs. Read only. Defaults to `"url"`. |
| `.schemes` | `URISchemes \| undefined` | Whitelist of allowed URI schemes. Read only. Defaults to `HTTP_SCHEMES`. |

## Returns

| Type | Description |
| --- | --- |
| `URISchema` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `schemes` | `URISchemes` | Whitelist of allowed URI schemes, e.g. `["https:", "http:"]`. Read only. |

## Examples

```ts
const schema = new URISchema({});
	schema.validate("https://www.google.com") // "https://www.google.com/"
```

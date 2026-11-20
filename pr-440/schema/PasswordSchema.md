# PasswordSchema

- Kind: class
- Import: `import { PasswordSchema } from "shelving/schema";`
- Extends: `StringSchema`

Schema that defines a valid password string.

- Defaults the `<input />` hint to `"password"`, but a caller can override it (e.g. `"text"` for a show-password toggle).
- Formats the value unchanged (like `StringSchema`) so a password `<input />` can hold and mask it — hiding the value is the input's job, not the schema's.

## Signatures

```ts
new PasswordSchema({ one = "password", title = "Password", min = 6, input = "password", ...options }: StringSchemaOptions = {})
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `StringSchemaOptions` | Defaults to `{}`. |
| `.value` | `string \| undefined` | Default string value used when the input is `undefined`. Read only. Defaults to `""`. |
| `.min` | `number \| undefined` | Minimum allowed character length. Read only. Defaults to `0`. |
| `.max` | `number \| undefined` | Maximum allowed character length. Read only. Defaults to `Number.POSITIVE_INFINITY`. |
| `.multiline` | `boolean \| undefined` | Whether the string keeps line breaks (multiline sanitization). An input for it is a `<textarea>` that grows. Read only. Defaults to `false`. |
| `.rows` | `number \| undefined` | Rows a multiline input shows at first. Set `1` for a box that starts one line high, like a chat message. Single-line inputs ignore it. Read only. Defaults to `` `2` when `multiline`, else `1` ``. |
| `.match` | `RegExp \| undefined` | Regular expression the sanitized string must match. Read only. Optional. |
| `.case` | `"upper" \| "lower" \| undefined` | Force the result to `"upper"` or `"lower"` case. Read only. Optional. |
| `.input` | `StringInputType \| undefined` | HTML `<input />` `type=""` hint for downstream UIs. Read only. Defaults to `"text"`. |

## Returns

| Type | Description |
| --- | --- |
| `PasswordSchema` |  |

## Examples

```ts
new PasswordSchema({}).validate("hunter2"); // Returns "hunter2"
```

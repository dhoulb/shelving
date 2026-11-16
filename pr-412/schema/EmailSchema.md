# EmailSchema

- Kind: class
- Import: `import { EmailSchema } from "shelving/schema";`
- Extends: `StringSchema`

Schema that defines a valid email address.

- Falsy values are converted to `""` empty string.
- Total length must be 254 characters or fewer (in SMTP email is encoded with `<` and `>` to make 256 characters).
- No minimum length is enforced because the email's format is enforced instead.
- RFC specifies username _should_ be case insensitive to avoid confusion.
    - We lowercase the entire address as a simple way to enforce this.
    - This is technically incorrect but practically better, and avoids case insensitive lookups in databases etc.
- Username portion must be 64 characters or fewer from the range `[a-z0-9.!#$%&’*+/=?^_`{|}~-]`
    - We subset this to `[a-z0-9._+-]` with no special characters at start/end (and we lowercase automatically).
    - If someone uses e.g. `*` asterisk at all or '-' at the start then it's most likely to be a mistake.
- Server portion must be a valid domain
    - Limited to `[a-z0-9]` with mid-word hyphens only.
    - Up to 10 segments of up to 63 characters each, separated by `.`
    - TLD is a segment of 2-63 characters, possibly in `xn--` international format.

## Signatures

```ts
new EmailSchema({ one = "email address", title = "Email", input = "email", max = 254, ...options }: EmailSchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `EmailSchemaOptions` |  |
| `.value` | `string \| undefined` | Default string value used when the input is `undefined`. Read only. Optional. |
| `.max` | `number \| undefined` | Maximum allowed character length. Read only. Defaults to `254`. |
| `.case` | `"upper" \| "lower" \| undefined` | Force the result to `"upper"` or `"lower"` case. Read only. Optional. |
| `.input` | `StringInputType \| undefined` | HTML `<input />` `type=""` hint for downstream UIs. Read only. Defaults to `"email"`. |

## Returns

| Type | Description |
| --- | --- |
| `EmailSchema` |  |

## Examples

```ts
EMAIL.validate("Test@Test.com"); // Returns "test@test.com"
```

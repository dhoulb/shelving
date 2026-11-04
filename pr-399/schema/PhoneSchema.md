# PhoneSchema

- Kind: class
- Import: `import { PhoneSchema } from "shelving/schema";`
- Extends: `StringSchema`

Schema that defines a valid phone number.

- Multiple string formats are automatically converted to E.164 format (starting with `+` plus).
- Falsy values are converted to `""` empty string.

## Signatures

```ts
new PhoneSchema({ one = "phone number", title = "Phone", input = "tel", max = 16, ...options }: PhoneSchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `PhoneSchemaOptions` |  |
| `.value` | `string \| undefined` | Default string value used when the input is `undefined`. Read only. Optional. |
| `.max` | `number \| undefined` | Maximum allowed character length. Read only. Defaults to `16`. |
| `.case` | `"upper" \| "lower" \| undefined` | Force the result to `"upper"` or `"lower"` case. Read only. Optional. |
| `.input` | `StringInputType \| undefined` | HTML `<input />` `type=""` hint for downstream UIs. Read only. Defaults to `"tel"`. |

## Returns

| Type | Description |
| --- | --- |
| `PhoneSchema` |  |

## Examples

```ts
PHONE.validate("+44 1234 567890"); // Returns "+441234567890"
```

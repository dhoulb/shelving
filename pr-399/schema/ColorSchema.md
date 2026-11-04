# ColorSchema

- Kind: class
- Import: `import { ColorSchema } from "shelving/schema";`
- Extends: `StringSchema`

Schema that defines a valid color hex string, e.g. `#00CCFF`

- Coerces the value to a six-digit uppercase `#RRGGBB` hex string.
- Rejects anything that isn't a valid hex color (use `NULLABLE_COLOR` to also allow `null`).

## Signatures

```ts
new ColorSchema({ one = "color", title = "Color", value = "#000000", input = "color", max = 7, ...options }: ColorSchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `ColorSchemaOptions` |  |
| `.value` | `string \| undefined` | Default hex value used when the input is `undefined`. Read only. Defaults to `"#000000"`. |
| `.max` | `number \| undefined` | Maximum allowed character length. Read only. Defaults to `7`. |
| `.case` | `"upper" \| "lower" \| undefined` | Force the result to `"upper"` or `"lower"` case. Read only. Optional. |
| `.input` | `StringInputType \| undefined` | HTML `<input />` `type=""` hint for downstream UIs. Read only. Defaults to `"color"`. |

## Returns

| Type | Description |
| --- | --- |
| `ColorSchema` |  |

## Examples

```ts
COLOR.validate("00ccff"); // Returns "#00CCFF"
```

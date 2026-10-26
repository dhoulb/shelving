# KeySchema

- Kind: class
- Import: `import { KeySchema } from "shelving/schema";`
- Extends: `StringSchema`

Schema that validates a database key string, stripping any non-alphanumeric characters.

- Characters that are not a-z, A-Z, 0-9 are removed.
- Default minimum key length is 1 character.
- Default maximum key length is 32 characters.
- 32 characters is enough for UUIDs, as the 4 `-` hyphens are removed.

## Signatures

```ts
new KeySchema({ one = "key", title = "Key", min = 1, max = 32, ...options }: StringSchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `StringSchemaOptions` |  |
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
| `KeySchema` |  |

## Examples

```ts
const schema = new KeySchema({});
 schema.validate("a1b2-c3d4"); // "a1b2c3d4"
```

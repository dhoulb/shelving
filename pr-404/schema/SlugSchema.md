# SlugSchema

- Kind: class
- Import: `import { SlugSchema } from "shelving/schema";`
- Extends: `StringSchema`

Schema that defines a valid slug, e.g. `this-is-a-slug`.

- Useful for URL components, usernames, etc.
- Input is sanitized into a lowercase, hyphen-separated slug.
- Slugs are limited to 32 characters.

## Signatures

```ts
new SlugSchema({ max = 32, ...options }: SlugSchemaOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `SlugSchemaOptions` |  |
| `.value` | `string \| undefined` | Default string value used when the input is `undefined`. Read only. Optional. |
| `.max` | `number \| undefined` | Maximum allowed character length. Read only. Defaults to `32`. |
| `.match` | `RegExp \| undefined` | Regular expression the sanitized string must match. Read only. Optional. |
| `.case` | `"upper" \| "lower" \| undefined` | Force the result to `"upper"` or `"lower"` case. Read only. Optional. |
| `.input` | `StringInputType \| undefined` | HTML `<input />` `type=""` hint for downstream UIs. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `SlugSchema` |  |

## Examples

```ts
const schema = new SlugSchema({});
	schema.validate("This is a Slug!") // "this-is-a-slug"
```

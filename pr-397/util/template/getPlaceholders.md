# getPlaceholders()

- Kind: function
- Import: `import { getPlaceholders } from "shelving/util/template";`

Get list of placeholders named in a template string.

## Signatures

```ts
getPlaceholders(template: string): TemplatePlaceholders
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `template` | `string` | The template including template placeholders, e.g. `:name-${country}/{city}` |

## Returns

| Type | Description |
| --- | --- |
| `TemplatePlaceholders` | Array of clean string names of found placeholders, e.g. `["name", "country", "city"]` |

## Examples

```ts
getPlaceholders(":name-${country}/{city}") // ["name", "country", "city"]
```

# matchTemplate()

- Kind: function
- Import: `import { matchTemplate } from "shelving/util/template";`

Match a template against a target string with no separator semantics.
- Turn `:year-:month` and `2016-06`... etc into `{ year: "2016"... }`.
- Non-catchall placeholders match non-empty values; catchall placeholders (`**`, `:name*`, `{...name}`, etc.) allow empty values.

## Signatures

```ts
matchTemplate(template: string, target: string, caller: AnyCaller = matchTemplate): TemplateMatches | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `template` | `string` | The template string, e.g. `:name-${country}/{city}`. |
| `target` | `string` | The string containing values, e.g. `Dave-UK/Manchester`. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `matchTemplate` itself). Defaults to `matchTemplate`. |

## Returns

| Type | Description |
| --- | --- |
| `TemplateMatches \| undefined` | An object containing values (e.g. `{ name: "Dave", country: "UK", city: "Manchester" }`), or `undefined` if no match. |

## Throws

| Type | Description |
| --- | --- |
| `ValueError` | If two template placeholders are not separated by at least one character. |

## Examples

```ts
matchTemplate(":name-${country}/{city}", "Dave-UK/Manchester") // { name: "Dave", country: "UK", city: "Manchester" }
```

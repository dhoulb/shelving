# renderTemplate()

- Kind: function
- Import: `import { renderTemplate } from "shelving/util/template";`

Turn ":year-:month" and `{ year: "2016"... }` etc into "2016-06..." etc.

## Signatures

```ts
renderTemplate(template: string, values: TemplateValues, caller: AnyCaller = renderTemplate): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `template` | `string` | The template including template placeholders, e.g. `:name-${country}/{city}` |
| `values` | `TemplateValues` | An object containing values, e.g. `{ name: "Dave", country: "UK", city: "Manchester" }` (functions are called, everything else converted to string), or a function or string to use for all placeholders. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `renderTemplate` itself). Defaults to `renderTemplate`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The rendered string, e.g. `Dave-UK/Manchester` |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If a placeholder in the template string is not specified in values. |

## Examples

```ts
renderTemplate(":name-${country}/{city}", { name: "Dave", country: "UK", city: "Manchester" }) // "Dave-UK/Manchester"
```

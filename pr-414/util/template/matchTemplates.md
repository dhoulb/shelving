# matchTemplates()

- Kind: function
- Import: `import { matchTemplates } from "shelving/util/template";`

Match multiple templates against a target string and return the first match (no separator semantics).

## Signatures

```ts
matchTemplates(templates: Iterable<string> & NotString, target: string): TemplateMatches | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `templates` | `Iterable<string> & NotString` | Iterable of template strings to try in order, e.g. `[":name-:age", ":name"]`. |
| `target` | `string` | The string containing values, e.g. `Dave-40`. |

## Returns

| Type | Description |
| --- | --- |
| `TemplateMatches \| undefined` | An object of values for the first matching template, or `undefined` if none match. |

## Examples

```ts
matchTemplates([":name-:age", ":name"], "Dave-40") // { name: "Dave", age: "40" }
```

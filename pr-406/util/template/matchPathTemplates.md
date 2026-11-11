# matchPathTemplates()

- Kind: function
- Import: `import { matchPathTemplates } from "shelving/util/template";`

Match multiple path-shaped templates against a target path and return the first match.

## Signatures

```ts
matchPathTemplates(templates: Iterable<AbsolutePath> & NotString, target: AbsolutePath): TemplateMatches | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `templates` | `Iterable<AbsolutePath> & NotString` | Iterable of path-shaped template strings to try in order, e.g. `["/users/{name}", "/users"]`. |
| `target` | `AbsolutePath` | The path containing values, e.g. `/users/Dave`. |

## Returns

| Type | Description |
| --- | --- |
| `TemplateMatches \| undefined` | An object of values for the first matching template, or `undefined` if none match. |

## Examples

```ts
matchPathTemplates(["/users/{name}", "/users"], "/users/Dave") // { name: "Dave" }
```

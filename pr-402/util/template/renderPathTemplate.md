# renderPathTemplate()

- Kind: function
- Import: `import { renderPathTemplate } from "shelving/util/template";`

Render a path-shaped template, percent-encoding each substituted value so it stays within its path segment.

Unlike `renderTemplate()`, each placeholder value is run through `encodeURIComponent()` before substitution.
This stops a value that contains `/`, `?`, `#`, `%`, or control characters from escaping its segment and
altering the resolved URL — i.e. path traversal to a different endpoint, or query/fragment injection — when
the result is resolved against a base URL (e.g. by `ClientAPIProvider`). Catchall placeholders (`**`,
`{...path}`, …) legitimately span segments, so each `/`-separated part is encoded but the separators are kept.

Note: because `encodeURIComponent()` does not encode `.`, a value that is exactly `.` or `..` still renders as
`.`/`..`; callers that treat a placeholder as a trusted single segment should validate against those.

## Signatures

```ts
renderPathTemplate(template: AbsolutePath, values: TemplateValues, caller: AnyCaller = renderPathTemplate): AbsolutePath
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `template` | `AbsolutePath` | The path-shaped template including placeholders, e.g. `/users/{name}`. |
| `values` | `TemplateValues` | An object containing values (functions are called, everything else converted to string), or a function or string to use for all placeholders. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `renderPathTemplate` itself). Defaults to `renderPathTemplate`. |

## Returns

| Type | Description |
| --- | --- |
| `AbsolutePath` | The rendered path with each value percent-encoded, e.g. `/users/Dave`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If a placeholder in the template string is not specified in values. |

## Examples

```ts
renderPathTemplate("/users/{name}", { name: "a/b" }) // "/users/a%2Fb"
```

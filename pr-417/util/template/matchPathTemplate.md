# matchPathTemplate()

- Kind: function
- Import: `import { matchPathTemplate } from "shelving/util/template";`

Match a path-shaped template against a target path.
- Like `matchTemplate()`, but with `/` segment semantics: non-catchall placeholders cannot span path segments; catchall placeholders can.
- A trailing catchall (e.g. `/files/{...path}`) also matches when the trailing separator is absent (e.g. `/files`), with the catchall value as `""`.
- Matched values are **percent-decoded** (the inverse of `renderPathTemplate()`'s encoding), so a round trip is lossless: `matchPathTemplate(t, renderPathTemplate(t, values))` returns the original values. Catchall values keep their `/` separators (each segment is decoded).
- Returns `undefined` if `target` is not validly percent-encoded (e.g. a bare `%` or `%zz`), treating a malformed path as a non-match.

## Signatures

```ts
matchPathTemplate(template: AbsolutePath, target: AbsolutePath, caller: AnyCaller = matchPathTemplate): TemplateMatches | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `template` | `AbsolutePath` | The path-shaped template string, e.g. `/users/{name}`. |
| `target` | `AbsolutePath` | The path containing values, e.g. `/users/Dave`. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `matchPathTemplate` itself). Defaults to `matchPathTemplate`. |

## Returns

| Type | Description |
| --- | --- |
| `TemplateMatches \| undefined` | An object containing decoded values (e.g. `{ name: "Dave" }`), or `undefined` if no match. |

## Throws

| Type | Description |
| --- | --- |
| `ValueError` | If two template placeholders are not separated by at least one character. |

## Examples

```ts
matchPathTemplate("/users/{name}", "/users/Dave") // { name: "Dave" }
```

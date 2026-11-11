# insertPlaygroundSnippet()

- Kind: function
- Import: `import { insertPlaygroundSnippet } from "shelving/ui";`

Insert a TSX snippet into playground code, and merge the snippet's imports into the code's imports.
- The snippet body goes on its own lines at `at` (or at the end of the code).
- Each name in a snippet `import { … } from "…"` is added to the code's import from the same module, or a new import is added at the top.

## Signatures

```ts
insertPlaygroundSnippet(code: string, snippet: string, at?: number | undefined): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `code` | `string` | The playground code. |
| `snippet` | `string` | The TSX snippet to insert, e.g. `PlaygroundComponent.snippet`. |
| `at` | `number \| undefined` | The cursor position in `code`, e.g. the `selectionStart` of the text box. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The new code. |

## Examples

```ts
insertPlaygroundSnippet("", 'import { Button } from "shelving/ui";\n\n<Button>Hi</Button>') // 'import { Button } from "shelving/ui";\n\n<Button>Hi</Button>\n'
```

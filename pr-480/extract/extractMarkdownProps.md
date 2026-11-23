# extractMarkdownProps()

- Kind: function
- Import: `import { extractMarkdownProps } from "shelving/extract";`

Parse a markdown source string once and derive its `title` and `description` in a single pass.
- `title` — plain text of the first `# h1` heading, or `undefined` if there is none.
- `description` — plain-text summary of the first prose paragraph, or `undefined` if there is none.
- Both query the parsed markup tree, so inline syntax (`` `code` ``, `*emphasis*`, links) resolves to clean plain text.

## Signatures

```ts
extractMarkdownProps(text: string): { title: string | undefined; description: string | undefined }
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `text` | `string` | The markdown source string (a markdown file's text, or a JSDoc description). |

## Returns

| Type | Description |
| --- | --- |
| `{ title: string \| undefined; description: string \| undefined }` | An object whose `title` and `description` are each a plain string, or `undefined` when absent. |

## Examples

```ts
extractMarkdownProps("# Title\n\nSome intro.") // { title: "Title", description: "Some intro." }
```

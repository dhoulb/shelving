# DocumentationPlaygroundVariables

- Kind: component
- Import: `import { DocumentationPlaygroundVariables } from "shelving/ui";`

Searchable index of every CSS variable that shelving components read, grouped by the module that owns it.
- Fetches the index from `PLAYGROUND_VARIABLES_PATH`, which the docs build writes.
- Each group shows a `:root` rule that you can copy, with each variable set to its default and its description as a comment.
- "Add to CSS" adds the group's rule (only the variables that match the search) to the playground CSS.

## Signatures

```ts
DocumentationPlaygroundVariables({ onAdd }: DocumentationPlaygroundVariablesProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DocumentationPlaygroundVariablesProps` |  |
| `.onAdd` | `(css: string) => void` | Called with a `:root` CSS rule when you press "Add to CSS" for a group. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |

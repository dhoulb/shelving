# formatPlaygroundCSS()

- Kind: function
- Import: `import { formatPlaygroundCSS } from "shelving/ui";`

Format CSS variables as a `:root` rule that you can paste into the playground CSS and change.
- Each variable is set to its default value, with its description as a comment.

## Signatures

```ts
formatPlaygroundCSS(variables: readonly PlaygroundVariable[]): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variables` | `readonly PlaygroundVariable[]` | The variables to put in the rule. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The CSS rule, or `""` if there are no variables. |

## Examples

```ts
formatPlaygroundCSS([{ name: "--card-radius", value: "var(--radius-normal)" }]) // ":root {\n  --card-radius: var(--radius-normal);\n}\n"
```

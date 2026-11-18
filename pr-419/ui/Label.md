# Label

- Kind: component
- Import: `import { Label } from "shelving/ui";`

Label heading, a `<h3>` with a labelly appearance (UPPERCASE but with a smaller text size).
- This is the default style used by things like a `<th>` from a `<table>`.
- Default text properties for all of these can be controlled with global variables: `--size-label`, `--font-label`, `--case-label`.

## Signatures

```ts
Label({ level = "3", children, className, ...props }: LabelProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `LabelProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Examples

```ts
<Label>Email address</Label>
```

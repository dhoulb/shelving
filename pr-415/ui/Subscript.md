# Subscript

- Kind: component
- Import: `import { Subscript } from "shelving/ui";`

Subscript text — renders a `<sub>` element for typographically lowered text (e.g. chemical formulae).

## Signatures

```ts
Subscript({ children, className }: SubscriptProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `SubscriptProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Examples

```ts
<>H<Subscript>2</Subscript>O</>
```

# Until

- Kind: component
- Import: `import { Until } from "shelving/ui";`

Remaining time — shows an unsigned string like `6d` or `3w` for a future date wrapped in a `<time>` element carrying the machine-readable date.

## Signatures

```ts
Until(props: UntilProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `UntilProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` (or `current`) cannot be coerced to a valid date. |

## Examples

```ts
<Until target="2030-01-01" />
```

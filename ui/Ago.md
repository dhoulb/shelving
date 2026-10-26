# Ago

- Kind: component
- Import: `import { Ago } from "shelving/ui";`

Elapsed time — shows an unsigned string like `3m`, `6mo` or `just now` for a past date wrapped in a `<time>` element carrying the machine-readable date.

## Signatures

```ts
Ago(props: AgoProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `AgoProps` |  |

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
<Ago target="2020-01-01" />
```

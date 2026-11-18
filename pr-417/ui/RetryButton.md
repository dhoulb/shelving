# RetryButton

- Kind: component
- Import: `import { RetryButton } from "shelving/ui";`

Button that retries the nearest `<Catcher>` error boundary when clicked.

- Reads the retry callback from `<Catcher>`'s private context, so it renders `null` when there is no boundary above it to retry.
- Defaults to an "Retry" label with a refresh icon; pass `children` to override.

## Signatures

```ts
RetryButton({ children = _RETRY_CHILDREN, ...props }: RetryButtonProps): ReactElement | null
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `RetryButtonProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement \| null` |  |

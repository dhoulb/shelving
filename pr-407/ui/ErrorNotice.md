# ErrorNotice

- Kind: component
- Import: `import { ErrorNotice } from "shelving/ui";`

Render a caught error as an inline `<Notice>` with a retry button.

- Uses `getMessage()` to extract a human-readable message, falling back to `"Unknown error"`.

## Signatures

```ts
ErrorNotice({ reason }: ErrorProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ErrorProps` |  |
| `.reason` | `unknown` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

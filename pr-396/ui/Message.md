# Message()

- Kind: function
- Import: `import { Message } from "shelving/ui";`

Status-coloured paragraph used for inline feedback messages.

- Sets an ARIA `role` of `"alert"` for error/danger statuses, otherwise `"status"`.

## Signatures

```ts
Message({ children, className, ...props }: MessageProps): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `MessageProps` |  |

## Examples

```ts
<Message status="error">Something went wrong</Message>
```

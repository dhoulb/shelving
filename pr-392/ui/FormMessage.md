# FormMessage

- Kind: component
- Import: `import { FormMessage } from "shelving/ui";`

Show the current form's "main" (unnamed) message as a `<Message>`, or render nothing when there is no message.

## Signatures

```ts
FormMessage(props: Omit<MessageProps, "children">): ReactElement | null
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `Omit<MessageProps, "children">` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement \| null` | A `<Message status="error">` containing the message, or `null` when empty. |

## Examples

```ts
<FormMessage />
```

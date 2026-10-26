# FormNotice

- Kind: component
- Import: `import { FormNotice } from "shelving/ui";`

Show the current form's "main" (unnamed) message as a `<Notice>`, or render nothing when there is no message.

## Signatures

```ts
FormNotice(props: Omit<NoticeProps, "children">): ReactElement | null
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `Omit<NoticeProps, "children">` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement \| null` | A `<Notice status="error">` containing the message, or `null` when empty. |

## Examples

```ts
<FormNotice />
```

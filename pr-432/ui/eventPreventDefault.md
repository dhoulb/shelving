# eventPreventDefault()

- Kind: function
- Import: `import { eventPreventDefault } from "shelving/ui";`

Call `event.preventDefault()` on an event.

- Handy as a ready-made event handler, e.g. `onSubmit={eventPreventDefault}`.

## Signatures

```ts
eventPreventDefault(e: Pick<Event, "preventDefault">): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `e` | `Pick<Event, "preventDefault">` | The event to suppress the default action of. |

## Examples

```ts
<form onSubmit={eventPreventDefault}>…</form>
```

# eventLoopFocus()

- Kind: function
- Import: `import { eventLoopFocus } from "shelving/ui";`

Loop focus inside an element in response to a `blur` event — a ready-made `onBlur` handler that traps focus.

- Pulls focus back to the first focusable child when it blurs outside the event's `currentTarget`.

## Signatures

```ts
eventLoopFocus({ currentTarget, relatedTarget }: { currentTarget: Element; relatedTarget: Element | null }): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `event` | `{ currentTarget: Element; relatedTarget: Element \| null }` | The `blur` event, providing `currentTarget` (the container) and `relatedTarget` (the new focus target). |

## Examples

```ts
<div onBlur={eventLoopFocus}>…</div>
```

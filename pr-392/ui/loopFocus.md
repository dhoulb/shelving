# loopFocus()

- Kind: function
- Import: `import { loopFocus } from "shelving/ui";`

Loop focus inside an element so it can't escape — refocus the first focusable child when focus moves out.

- When `nextTarget` falls outside `element`, focus is pulled back to the first focusable element inside it (a simple focus trap).

## Signatures

```ts
loopFocus(element: Nullish<Element>, nextTarget: Nullish<Element>): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `element` | `Nullish<Element>` | The container to keep focus within. |
| `nextTarget` | `Nullish<Element>` | The element focus is moving to. |

## Examples

```ts
loopFocus(dialog, document.activeElement);
```

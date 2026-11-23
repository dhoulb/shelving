# focusFirstFocusable()

- Kind: function
- Import: `import { focusFirstFocusable } from "shelving/ui";`

Focus on the first focusable element inside an element.

- No-op for nullish input or non-`HTMLElement` nodes, and when the element contains nothing focusable.

## Signatures

```ts
focusFirstFocusable(el: Nullish<Element>): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `el` | `Nullish<Element>` | The container element to focus the first focusable descendant of. |

## Examples

```ts
focusFirstFocusable(dialogRef.current);
```

# getFirstFocusable()

- Kind: function
- Import: `import { getFirstFocusable } from "shelving/util/focus";`

Find the first focusable element inside an HTML element (including the element itself).
- An element is focusable if it's an enabled link, button, input, select, or textarea, or has a non-negative `tabindex`.

## Signatures

```ts
getFirstFocusable(el: HTMLElement): HTMLElement | null
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `el` | `HTMLElement` | The HTML element to search (it is tested first, then its descendants). |

## Returns

| Type | Description |
| --- | --- |
| `HTMLElement \| null` | The first focusable `HTMLElement`, or `null` if none is found. |

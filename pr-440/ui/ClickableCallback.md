# ClickableCallback

- Kind: type
- Import: `import { ClickableCallback } from "shelving/ui";`

Handler for a clickable `onClick` event.
- Returned value (if defined) is notified to the user using `notifySuccess()`
- Thrown value is notified to the user using `notifyError()`

## Signatures

```ts
(event: MouseEvent<HTMLButtonElement>) => ReactNode | void | PromiseLike<ReactNode | void>
```

## Returns

| Type | Description |
| --- | --- |
| `unknown` | A `ReactNode` (shown as a success notice), nothing, or a promise of either. |

## Types

- `MouseEvent`
- `HTMLButtonElement`
- `ReactNode`
- `PromiseLike`

# waitForKeyboard()

- Kind: function
- Import: `import { waitForKeyboard } from "shelving/ui";`

Lower the on-screen keyboard, and wait until it is down.
- Blurs the focused text field, if there is one, so the keyboard starts to close.
- When the keyboard is open (`isKeyboardOpen()`) or a field was just blurred, it waits until the keyboard is down and the
  viewport has stopped changing size, for at most half a second.
- Returns nothing when there is nothing to wait for, so a caller can go on at once without a promise.
- Use it before a page slide: a keyboard that closes during a view transition resizes the page in the middle of it.

## Signatures

```ts
waitForKeyboard(): Promise<void> | void
```

## Returns

| Type | Description |
| --- | --- |
| `Promise<void> \| void` | A promise that resolves when the keyboard is down, or nothing when it is down already. |

## Examples

```ts
const waiting = waitForKeyboard(); if (waiting) await waiting;
```

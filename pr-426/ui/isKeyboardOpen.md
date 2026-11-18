# isKeyboardOpen()

- Kind: function
- Import: `import { isKeyboardOpen } from "shelving/ui";`

Is the on-screen keyboard open (or still closing)?
- On iOS (Safari, home-screen web apps and `WKWebView`) the keyboard makes the visual viewport shorter than the window.
- Returns `false` when the page is zoomed in, because a zoomed visual viewport is also shorter than the window.
- Returns `false` where the keyboard resizes the whole page (Android Chrome by default), and with no on-screen keyboard.

## Signatures

```ts
isKeyboardOpen(): boolean
```

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` when the visual viewport is much shorter than the window. |

## Examples

```ts
if (isKeyboardOpen()) await waitForKeyboard();
```

# isKeyboardOpen()

- Kind: function
- Import: `import { isKeyboardOpen } from "shelving/ui";`

Is the on-screen keyboard open (or still closing)?
- On iOS (Safari, home-screen web apps and `WKWebView`) the keyboard makes the visual viewport shorter than the window,
  or pushes it up (`visualViewport.offsetTop`). When the page cannot scroll, iOS shrinks the window too, so only the push
  shows the keyboard.
- Returns `false` when the page is zoomed in, because a zoomed visual viewport is also shorter than the window and moves.
- Returns `false` where the keyboard resizes the whole page (Android Chrome by default), and with no on-screen keyboard.

## Signatures

```ts
isKeyboardOpen(): boolean
```

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` when the visual viewport is much shorter than the window, or pushed up. |

## Examples

```ts
if (isKeyboardOpen()) await waitForKeyboard();
```

# FullscreenButton

- Kind: component
- Import: `import { FullscreenButton } from "shelving/ui";`

Button to toggle the surrounding `<figure>` element or `<body>` element in/out of fullscreen mode.
- Renders `null` when the browser does not support the Fullscreen API.
- Tracks fullscreen state so the icon and title toggle between enter/exit.
- Parent can be identified by `props.target`, but defaults to `figure, body` does not exist, the button will do nothing when clicked.
- The `<Figure>` and `<Video>` components are rendered as `<figure>` so this works out the box with both of these.
- If not contained in a `<figure>` by default the

## Signatures

```ts
FullscreenButton({ target = "body, figure", ...props }: FullscreenButtonProps): ReactElement | null
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `FullscreenButtonProps` |  |
| `.target` | `string` | CSS selector to identify the parent element to toggle fullscreen status on. Defaults to `"body, figure"`. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement \| null` | Rendered fullscreen toggle button, or `null` when fullscreen is unavailable. |

## Examples

```ts
<Video><video src="/clip.mp4" /><FullscreenButton /></Video>
```

# ImageInput

A large square image picker. With no image, it shows a "Choose…" button in the middle. With an image, the image fills the square and an X button in the corner clears it.

## Things to know

- A tap anywhere on the square opens the file picker. On a phone this is the built-in photo picker, which can also take a photo.
- `onValue` gets the picked `File`, or `undefined` when the X button clears the image.
- `value` is the image to show: a picked `File`, or the URL of the current image (for example, a saved profile photo).
- The square is as wide as its container. Put it in a narrow container to make it smaller.
- `placeholder` sets the button text (default "Choose…"). `title` labels the input for screen readers.
- `types` sets the image types the picker accepts (default JPEG, PNG, WebP, and GIF).

## Usage

```tsx
import { ImageInput } from "shelving/ui";

function PhotoPicker() {
  const [photo, setPhoto] = useState<File>();
  return <ImageInput name="photo" title="Photo" value={photo} onValue={setPhoto} />;
}
```

### Show the current image

```tsx
import { ImageInput } from "shelving/ui";

// Shows the saved photo. A new pick calls `onValue` with the new `File`.
<ImageInput name="photo" value={user.photoURL} onValue={upload} />
```

## Styling

`ImageInput` paints from the [tint ladder](/ui/TINT_CLASS). The "Choose…" and X buttons are `<Button>` styles, so `--button-*` hooks also move them.

| Variable | Styles | Default |
|---|---|---|
| `--image-input-space` | Space above and below the square | `var(--space-small)` (12px) |
| `--image-input-radius` | Corner radius of the square | `var(--radius-small)` (12px) |
| `--image-input-background` | Square background when empty | `var(--tint-90)` |
| `--image-input-preview-background` | Background behind the picked image, seen through a transparent image | `#000` |
| `--image-input-focus-border` | Outline when the input has focus | `var(--stroke-focus) solid var(--color-focus)` |
| `--image-input-invalid-border` | Outline when `message` is set | `var(--stroke-focus) solid var(--color-failure)` |
| `--image-input-clear-inset` | Distance of the X button from the top and end edges | `var(--space-small)` (12px) |

Global tokens it reads: `--tint-90`, `--space-small`, `--radius-small`, `--stroke-focus`, `--color-focus`, `--color-failure`.

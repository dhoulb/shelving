# ImageInput

- Kind: component
- Import: `import { ImageInput } from "shelving/ui";`

Square image picker that shows the picked image in the square.
- With no image, the square shows a "Choose…" button in the middle (change it with `placeholder`).
- With an image, the image fills the square and an X button in the corner clears it (`onValue(undefined)`).
- A tap anywhere on the square opens the file picker.
- `value` is a picked `File`, or the URL of the current image.

A large square image picker. With no image, it shows a "Choose…" button in the middle. With an image, the image fills the square and an X button in the corner clears it.

## Things to know

- A tap anywhere on the square opens the file picker. On a phone this is the built-in photo picker, which can also take a photo.
- `onValue` gets the picked `File`, or `undefined` when the X button clears the image.
- `value` is the image to show: a picked `File`, or the URL of the current image (for example, a saved profile photo).
- The square is as wide as its container. Put it in a narrow container to make it smaller.
- `placeholder` sets the button text (default "Choose…"). `title` labels the input for screen readers.
- `types` sets the image types the picker accepts (default `IMAGE_TYPES`).
- `capture` opens the front (`"user"`) or back (`"environment"`) camera straight away. On phones this skips the photo library, so people can only take a new photo. Leave it out to get the normal picker, which on a phone also offers to take a photo.

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


## Signatures

```ts
ImageInput({
	name,
	title = "Image",
	placeholder = "Choose…",
	required = false,
	disabled = false,
	message,
	value,
	onValue,
	types = IMAGE_TYPES,
	capture,
	className,
	...variants
}: ImageInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variants` | `ImageInputProps` |  |
| `.types` | `FileTypes \| undefined` | The image types the picker accepts. Defaults to `IMAGE_TYPES`. |
| `.capture` | `FileCapture \| undefined` | Which camera the picker opens straight away. On phones this skips the photo library. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

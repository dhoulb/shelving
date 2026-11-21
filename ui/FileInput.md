# FileInput

- Kind: component
- Import: `import { FileInput } from "shelving/ui";`

File picker input that emits the selected `File` through `onValue`.
- The optional `types` dictionary restricts the picker's accepted file types.
- The optional `capture` opens the front (`"user"`) or back (`"environment"`) camera straight away.

A file picker. Renders the browser's own `<input type="file">`.

**Things to know:**

- `onValue()` gets the picked `File`. The user can pick one file only.
- `types` sets the file types the picker accepts, in `{ extension: mime }` format, for example `IMAGE_TYPES`. With no `types`, it accepts any file.
- `capture` opens the front (`"user"`) or back (`"environment"`) camera straight away. On phones this skips the photo library.
- The input cannot show a file it did not pick, so `value` has no effect.
- The browser draws the button, so it looks different in each browser. For an image, `<ImageInput>` shows a preview.

## Usage

```tsx live
import { useState } from "react";
import { FileInput, Paragraph } from "shelving/ui";

function Upload() {
	const [file, setFile] = useState<string | File>();
	return (
		<>
			<FileInput name="file" title="Document" onValue={setFile} />
			<Paragraph>{file instanceof File ? `${file.name} (${file.size} bytes)` : "No file picked."}</Paragraph>
		</>
	);
}

<Upload />;
```

### Images only

```tsx live
import { FileInput } from "shelving/ui";
import { IMAGE_TYPES } from "shelving/util/file";

<FileInput name="photo" title="Photo" types={IMAGE_TYPES} onValue={() => {}} />;
```

## Styling

`FileInput` uses the shared input styles. See `getInputClass()` for the `--input-*` hooks.


## Signatures

```ts
FileInput({
	name,
	title,
	placeholder = title,
	required = false,
	disabled = false,
	message,
	// value,
	onValue,
	types = {},
	capture,
	className,
	...variants
}: FileInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variants` | `FileInputProps` |  |
| `.types` | `FileTypes \| undefined` | The file types the picker accepts. Optional. |
| `.capture` | `FileCapture \| undefined` | Which camera the picker opens straight away. On phones this skips the photo library. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A native `<input type="file">` element. |

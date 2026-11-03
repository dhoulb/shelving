# FileInput()

- Kind: function
- Import: `import { FileInput } from "shelving/ui";`

File picker input that emits the selected `File` through `onValue`.
- The optional `types` dictionary restricts the picker's accepted file types.
- The optional `capture` opens the front (`"user"`) or back (`"environment"`) camera straight away.

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

## Examples

```ts
<FileInput name="avatar" types={{ png: "image/png" }} onValue={setFile} />
```

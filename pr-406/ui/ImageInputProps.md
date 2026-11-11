# ImageInputProps

- Kind: interface
- Import: `import { ImageInputProps } from "shelving/ui";`
- Extends: `ValueInputProps<File, string>`

Props for `<ImageInput>`, a square image picker that emits the picked `File`.

## Signatures

```ts
{
	types?: FileTypes | undefined;
	capture?: FileCapture | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `types` | `FileTypes \| undefined` | The image types the picker accepts. Defaults to `IMAGE_TYPES`. |
| `capture` | `FileCapture \| undefined` | Which camera the picker opens straight away. On phones this skips the photo library. Optional. |

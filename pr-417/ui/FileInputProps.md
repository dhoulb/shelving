# FileInputProps

- Kind: interface
- Import: `import { FileInputProps } from "shelving/ui";`
- Extends: `ValueInputProps<string | File>`

Props for `FileInput`, an `<input type="file">` that emits the selected `File`.

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
| `types` | `FileTypes \| undefined` | The file types the picker accepts. Optional. |
| `capture` | `FileCapture \| undefined` | Which camera the picker opens straight away. On phones this skips the photo library. Optional. |

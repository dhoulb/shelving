# FileCapture

- Kind: type
- Import: `import { FileCapture } from "shelving/util/file";`

Which camera a file picker opens straight away: `"user"` is the front (selfie) camera, `"environment"` the back camera.
- Sets the `capture` attribute of `<input type="file">`.
- On phones, the picker then opens the camera only, with no photo library.

## Signatures

```ts
"user" | "environment"
```

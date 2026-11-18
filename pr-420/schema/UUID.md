# UUID

- Kind: constant
- Import: `import { UUID } from "shelving/schema";`

Sugar instance of `UUIDSchema` for any valid UUID (versions 1-5). Equivalent to `new UUIDSchema({ title: "ID" })`.

## Examples

```ts
UUID.validate("F47AC10B-58CC-4372-A567-0E02B2C3D479") // "f47ac10b-58cc-4372-a567-0e02b2c3d479"
```

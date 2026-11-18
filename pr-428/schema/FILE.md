# FILE

- Kind: constant
- Import: `import { FILE } from "shelving/schema";`

Sugar instance of `FileSchema` for a file name, e.g. `file.txt`. Equivalent to `new FileSchema({})`.

## Examples

```ts
FILE.validate("file.txt"); // Returns "file.txt"
```

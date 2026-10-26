# TIME

- Kind: constant
- Import: `import { TIME } from "shelving/schema";`

Sugar instance of `TimeSchema` for a required abstract time. Equivalent to `new TimeSchema({})`.

## Examples

```ts
TIME.validate("23:59") // "23:59:00.000"
```

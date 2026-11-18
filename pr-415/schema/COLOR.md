# COLOR

- Kind: constant
- Import: `import { COLOR } from "shelving/schema";`

Sugar instance of `ColorSchema` for a required hex color string, e.g. `#00CCFF`. Equivalent to `new ColorSchema({})`.

## Examples

```ts
COLOR.validate("#00CCFF"); // Returns "#00CCFF"
```

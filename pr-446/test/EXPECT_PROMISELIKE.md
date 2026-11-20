# EXPECT_PROMISELIKE

- Kind: constant
- Import: `import { EXPECT_PROMISELIKE } from "shelving/test";`

Asymmetric matcher that expects an object matching `PromiseLike` (i.e. has a `.then()` method).

## Examples

```ts
expect(value).toEqual(EXPECT_PROMISELIKE)
```

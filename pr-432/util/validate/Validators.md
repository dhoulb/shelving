# Validators

- Kind: type
- Import: `import { Validators } from "shelving/util/validate";`

A set of named validators in `{ name: Validator }` format.

## Signatures

```ts
{ readonly [K in keyof T]: Validator<T[K]> }
```

## Types

- [Validator](Validator.md): Object that can validate an unknown value with its validate() method.
- `K`

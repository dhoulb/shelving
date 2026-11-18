# ValidatorType

- Kind: type
- Import: `import { ValidatorType } from "shelving/util/validate";`

Extract the validated type from a `Validator`.

## Signatures

```ts
X extends Validator<infer Y> ? Y : never
```

## Types

- [Validator](Validator.md): Object that can validate an unknown value with its validate() method.
- `Y`

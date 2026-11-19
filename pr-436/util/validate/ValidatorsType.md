# ValidatorsType

- Kind: type
- Import: `import { ValidatorsType } from "shelving/util/validate";`

Extract the validated data type from a set of validators.

## Signatures

```ts
{ readonly [K in keyof T]: ValidatorType<T[K]> }
```

## Types

- [ValidatorType](ValidatorType.md): Extract the validated type from a Validator.
- `K`

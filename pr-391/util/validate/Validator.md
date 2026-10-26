# Validator

- Kind: interface
- Import: `import { Validator } from "shelving/util/validate";`

Object that can validate an unknown value with its `validate()` method.

## Signatures

```ts
{
	validate(unsafeValue: unknown): T;
}
```

## Methods

- [validate](Validator/validate.md): Validate an unsafe value and return a valid value.

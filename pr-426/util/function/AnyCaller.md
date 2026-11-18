# AnyCaller

- Kind: type
- Import: `import { AnyCaller } from "shelving/util/function";`

Any calling function or constructor, usually referring to something that can call in the current scope that can appear in a stack trace.

## Signatures

```ts
AnyFunction | AnyConstructor
```

## Types

- [AnyFunction](AnyFunction.md): Any function (purposefully as wide as possible for use with extends X or is X statements).
- [AnyConstructor](../class/AnyConstructor.md): Any class constructor (designed for use with extends AnyConstructor guards).

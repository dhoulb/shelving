# PossibleObject

- Kind: type
- Import: `import { PossibleObject } from "shelving/util/object";`

Something that can be converted to an object.
- Either the object itself, or an iterable set of key/value entry tuples.

## Signatures

```ts
T | Iterable<Prop<T>>
```

## Types

- `Iterable`
- [Prop](Prop.md): Prop for an object, as a readonly key/value entry tuple.

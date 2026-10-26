# Hydrations

- Kind: type
- Import: `import { Hydrations } from "shelving/util/hydrate";`

A set of hydrations describes a set of string keys and the class constructor to be dehydrated and rehydrated.
- We can't use `class.name` because we don't know that the name of the class will survive minification.

## Signatures

```ts
ImmutableDictionary<Class<unknown>>
```

## Types

- [ImmutableDictionary](../dictionary/ImmutableDictionary.md): Readonly dictionary object.
- [Class](../class/Class.md): Class prototype that can be used with instanceof.

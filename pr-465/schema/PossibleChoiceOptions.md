# PossibleChoiceOptions

- Kind: type
- Import: `import { PossibleChoiceOptions } from "shelving/schema";`

Things that can be converted to a `ChoiceOptions` dictionary.

- Dictionary of string options in `{ key: title }` format.
- Array of string options in `[key]` format (`key` is used as the `title` too).

## Signatures

```ts
ImmutableArray<K> | ChoiceOptions<K>
```

## Types

- [ImmutableArray](../util/array/ImmutableArray.md): Immutable array: an array that cannot be changed.
- [ChoiceOptions](ChoiceOptions.md): Dictionary of allowed options for a ChoiceSchema in { key: title } format.

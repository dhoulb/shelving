# PossibleDictionary

- Kind: type
- Import: `import { PossibleDictionary } from "shelving/util/dictionary";`

Value that can be converted to a dictionary object.
- Either the dictionary itself, or an iterable set of key/value entry tuples.

## Signatures

```ts
ImmutableDictionary<T> | Iterable<DictionaryItem<T>>
```

## Types

- [ImmutableDictionary](ImmutableDictionary.md): Readonly dictionary object.
- `Iterable`
- [DictionaryItem](DictionaryItem.md): Single item for a dictionary object in entry format.

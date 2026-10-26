# getDictionaryItems()

- Kind: function
- Import: `import { getDictionaryItems } from "shelving/util/dictionary";`

Turn a dictionary object into a set of props.

## Signatures

```ts
getDictionaryItems(input: ImmutableDictionary<T>): readonly DictionaryItem<T>[]
getDictionaryItems(input: PossibleDictionary<T>): Iterable<DictionaryItem<T>>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `ImmutableDictionary<T>` | The dictionary or iterable set of key/value entry tuples to read. |
| `input` | `PossibleDictionary<T>` |  |

## Returns

| Type | Description |
| --- | --- |
| `readonly DictionaryItem<T>[]` | Iterable set of key/value entry tuples for the dictionary. |
| `Iterable<DictionaryItem<T>>` |  |

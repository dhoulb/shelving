# withDictionaryItem

- Kind: constant
- Import: `import { withDictionaryItem } from "shelving/util/dictionary";`

Set an item on a dictionary object (immutably) and return a new object including that item.
- If the value is unchanged the original dictionary is returned unchanged.

## Signatures

```ts
withDictionaryItem: <T>(dict: ImmutableDictionary<T>, key: string, value: T) => ImmutableDictionary<T>
```

## Returns

| Type | Description |
| --- | --- |
| `unknown` | A new dictionary including the set item, or the original dictionary if the value was unchanged. |

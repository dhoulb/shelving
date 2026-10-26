# omitDictionaryItem

- Kind: constant
- Import: `import { omitDictionaryItem } from "shelving/util/dictionary";`

Remove an item from a dictionary object (immutably) and return a new object without that item.
- If the key doesn't exist the original dictionary is returned unchanged.

## Signatures

```ts
omitDictionaryItem: <T>(dict: ImmutableDictionary<T>, key: string) => ImmutableDictionary<T>
```

## Returns

| Type | Description |
| --- | --- |
| `unknown` | A new dictionary without the removed item, or the original dictionary if the key was not present. |

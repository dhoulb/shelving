# omitDictionaryItems

- Kind: constant
- Import: `import { omitDictionaryItems } from "shelving/util/dictionary";`

Remove several items from a dictionary object (immutably) and return a new object without those items.
- If none of the keys exist the original dictionary is returned unchanged.

## Signatures

```ts
omitDictionaryItems: <T>(dict: ImmutableDictionary<T>, ...keys: string[]) => ImmutableDictionary<T>
```

## Returns

| Type | Description |
| --- | --- |
| `unknown` | A new dictionary without the removed items, or the original dictionary if no keys were present. |

# withDictionaryItems

- Kind: constant
- Import: `import { withDictionaryItems } from "shelving/util/dictionary";`

Set several items on a dictionary object (immutably) and return a new object including those items.
- If all values are unchanged the original dictionary is returned unchanged.

## Signatures

```ts
withDictionaryItems: <T>(dict: ImmutableDictionary<T>, props: PossibleDictionary<T>) => ImmutableDictionary<T>
```

## Returns

| Type | Description |
| --- | --- |
| `unknown` | A new dictionary including the set items, or the original dictionary if all values were unchanged. |

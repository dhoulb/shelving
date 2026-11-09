# pickDictionaryItems

- Kind: constant
- Import: `import { pickDictionaryItems } from "shelving/util/dictionary";`

Pick several items from a dictionary object and return a new object with only those items.

## Signatures

```ts
pickDictionaryItems: <T>(dict: ImmutableDictionary<T>, ...keys: string[]) => ImmutableDictionary<T>
```

## Returns

| Type | Description |
| --- | --- |
| `unknown` | A new dictionary containing only the picked items. |

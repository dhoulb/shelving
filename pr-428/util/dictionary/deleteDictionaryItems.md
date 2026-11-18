# deleteDictionaryItems

- Kind: constant
- Import: `import { deleteDictionaryItems } from "shelving/util/dictionary";`

Remove several key/value entries from a dictionary object (by reference).

## Signatures

```ts
deleteDictionaryItems: <T extends MutableDictionary>(dict: T, ...keys: string[]) => void
```

# setDictionaryItems

- Kind: constant
- Import: `import { setDictionaryItems } from "shelving/util/dictionary";`

Set several named items on a dictionary object (by reference).
- Keys are trusted by contract: a runtime-untrusted key like `"__proto__"` would mutate the target's prototype, so validate or filter untrusted keys before calling (or use a null-prototype target).

## Signatures

```ts
setDictionaryItems: <T>(dict: MutableDictionary<T>, entries: PossibleDictionary<T>) => void
```

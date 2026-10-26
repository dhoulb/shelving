# setDictionaryItem

- Kind: constant
- Import: `import { setDictionaryItem } from "shelving/util/dictionary";`

Set a single named item on a dictionary object (by reference) and return its value.
- The key is trusted by contract: a runtime-untrusted key like `"__proto__"` would mutate the target's prototype, so validate or filter untrusted keys before calling (or use a null-prototype target).

## Signatures

```ts
setDictionaryItem: <T>(dict: MutableDictionary<T>, key: string, value: T) => T
```

## Returns

| Type | Description |
| --- | --- |
| `unknown` | The value that was set. |

# setProp()

- Kind: function
- Import: `import { setProp } from "shelving/util/object";`

Set a single named prop on an object (by reference) and return its value.
- The key is trusted by contract: a runtime-untrusted key like `"__proto__"` would mutate the target's prototype, so validate or filter untrusted keys before calling (or use a null-prototype target).

## Signatures

```ts
setProp(obj: T, key: K, value: T[K]): T[K]
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `obj` | `T` | The object to set the prop on (modified by reference). |
| `key` | `K` | The key of the prop to set. |
| `value` | `T[K]` | The value of the prop to set. |

## Returns

| Type | Description |
| --- | --- |
| `T[K]` | The value that was set. |

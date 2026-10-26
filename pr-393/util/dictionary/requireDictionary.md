# requireDictionary()

- Kind: function
- Import: `import { requireDictionary } from "shelving/util/dictionary";`

Convert a possible dictionary into a dictionary.
- If the value is iterable it is converted to a dictionary using `Object.fromEntries()`, otherwise it is returned as-is.

## Signatures

```ts
requireDictionary(dict: PossibleDictionary<T>): ImmutableDictionary<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `dict` | `PossibleDictionary<T>` | The dictionary or iterable set of key/value entry tuples to convert. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableDictionary<T>` | The corresponding dictionary object. |

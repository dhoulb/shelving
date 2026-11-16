# isDictionaryItem()

- Kind: function
- Import: `import { isDictionaryItem } from "shelving/util/dictionary";`

Is an unknown value the key for an own prop of a dictionary.

## Signatures

```ts
isDictionaryItem(dict: ImmutableDictionary<T>, key: unknown): key is string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `dict` | `ImmutableDictionary<T>` | The dictionary to test against. |
| `key` | `unknown` | The key to test for. |

## Returns

| Type | Description |
| --- | --- |
| `key is string` | `true` if `key` is a string and an own prop of `dict`, narrowing its type. |

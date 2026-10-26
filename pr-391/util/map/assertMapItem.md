# assertMapItem()

- Kind: function
- Import: `import { assertMapItem } from "shelving/util/map";`

Assert that an unknown value is a key for an item in a map.

## Signatures

```ts
assertMapItem(map: ImmutableMap<K, V>, key: unknown, caller: AnyCaller = assertMapItem): asserts key is K
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `map` | `ImmutableMap<K, V>` | The map to look in. |
| `key` | `unknown` | The candidate key to assert. |
| `caller` | `AnyCaller` | Function used to attribute a thrown error to the calling site. Defaults to `assertMapItem`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts key is K` | Nothing; narrows `key` to the map's key type. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `key` does not exist in `map`. |

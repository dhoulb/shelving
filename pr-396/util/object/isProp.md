# isProp()

- Kind: function
- Import: `import { isProp } from "shelving/util/object";`

Is an unknown value the key for an own prop of an object.

## Signatures

```ts
isProp(obj: T, key: PropertyKey): key is keyof T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `obj` | `T` | The object to test against. |
| `key` | `PropertyKey` | The key to test for. |

## Returns

| Type | Description |
| --- | --- |
| `key is keyof T` | `true` if `key` is an own prop of `obj`, narrowing its type. |

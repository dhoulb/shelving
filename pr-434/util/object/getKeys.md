# getKeys()

- Kind: function
- Import: `import { getKeys } from "shelving/util/object";`

Get the keys of an object as an array.

## Signatures

```ts
getKeys(obj: T): ImmutableArray<Key<T>>
getKeys(obj: T | Partial<T>): ImmutableArray<Key<T>>
getKeys(obj: T | Partial<T> | Iterable<Key<T>>): Iterable<Key<T>>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `obj` | `T` | The object to read the keys from. |
| `obj` | `T \| Partial<T>` |  |
| `obj` | `T \| Partial<T> \| Iterable<Key<T>>` |  |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<Key<T>>` | Iterable set of keys for the object. |
| `ImmutableArray<Key<T>>` |  |
| `Iterable<Key<T>>` |  |

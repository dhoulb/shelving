# deleteProps()

- Kind: function
- Import: `import { deleteProps } from "shelving/util/object";`

Remove several key/value entries from an object (by reference).

## Signatures

```ts
deleteProps(obj: T, ...keys: Key<T>[]): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `obj` | `T` | The object to remove the props from (modified by reference). |
| `keys` | `Key<T>[]` | The keys of the props to remove. |

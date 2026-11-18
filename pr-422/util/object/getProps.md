# getProps()

- Kind: function
- Import: `import { getProps } from "shelving/util/object";`

Get the props of an object as a set of entries.

## Signatures

```ts
getProps(obj: T): ImmutableArray<Prop<T>>
getProps(obj: T | Partial<T>): ImmutableArray<Prop<T>>
getProps(obj: T | Partial<T> | Iterable<Prop<T>>): Iterable<Prop<T>>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `obj` | `T` | The object to read the props from. |
| `obj` | `T \| Partial<T>` |  |
| `obj` | `T \| Partial<T> \| Iterable<Prop<T>>` |  |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<Prop<T>>` | Iterable set of key/value entry tuples for the object. |
| `ImmutableArray<Prop<T>>` |  |
| `Iterable<Prop<T>>` |  |

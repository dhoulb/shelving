# withProps()

- Kind: function
- Import: `import { withProps } from "shelving/util/object";`

Set several props on an object (immutably) and return a new object including those props.
- If all values are unchanged the original object is returned unchanged.

## Signatures

```ts
withProps(input: T, props: Partial<T>): T
withProps(input: T, props: T | Partial<T> | Iterable<Prop<T>>): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `T` | The object to set the props on. |
| `props` | `Partial<T>` | The props to set, as an object or iterable set of key/value entry tuples. |
| `input` | `T` |  |
| `props` | `T \| Partial<T> \| Iterable<Prop<T>>` |  |

## Returns

| Type | Description |
| --- | --- |
| `T` | A new object including the set props, or the original object if all values were unchanged. |
| `T` |  |

# mapProps()

- Kind: function
- Import: `import { mapProps } from "shelving/util/transform";`

Transform the values of an object's props into a new object.
- Keys are preserved; each prop entry is passed to `transform` to produce its new value.

## Signatures

```ts
mapProps(obj: I, transform: (prop: Prop<I>, ...args: A) => Value<O>, ...args: A): O
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `obj` | `I` | The source object. |
| `transform` | `(prop: Prop<I>, ...args: A) => Value<O>` | Function applied to each `[key, value]` prop to produce the output value. |
| `args` | `A` | Additional arguments passed through to `transform` on every call. |

## Returns

| Type | Description |
| --- | --- |
| `O` | A new object with the same keys and transformed values. |

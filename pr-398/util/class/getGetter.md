# getGetter()

- Kind: function
- Import: `import { getGetter } from "shelving/util/class";`

Get the 'getter' function for a given property, or `undefined` if it doesn't exist.

## Signatures

```ts
getGetter(obj: T, prop: K): ((this: T) => T[K]) | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `obj` | `T` | The object to read the property descriptor from. |
| `prop` | `K` | The property name to look up. |

## Returns

| Type | Description |
| --- | --- |
| `((this: T) => T[K]) \| undefined` | The getter function bound to `T`, or `undefined` if the property has no getter. |

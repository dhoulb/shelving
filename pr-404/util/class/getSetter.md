# getSetter()

- Kind: function
- Import: `import { getSetter } from "shelving/util/class";`

Get the 'setter' function for a given property, or `undefined` if it doesn't exist.

## Signatures

```ts
getSetter(obj: T, prop: K): ((this: T, value: T[K]) => void) | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `obj` | `T` | The object whose prototype is searched for the property descriptor. |
| `prop` | `K` | The property name to look up. |

## Returns

| Type | Description |
| --- | --- |
| `((this: T, value: T[K]) => void) \| undefined` | The setter function bound to `T`, or `undefined` if the property has no setter. |

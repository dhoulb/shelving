# getPrototype()

- Kind: function
- Import: `import { getPrototype } from "shelving/util/object";`

Get the prototype of an object instance.
- Recommend to use this because Typescript's default lib specifies `Object.getPrototypeOf()` returning `any`.

## Signatures

```ts
getPrototype(obj: T): Partial<T> | null
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `obj` | `T` | The object to read the prototype from. |

## Returns

| Type | Description |
| --- | --- |
| `Partial<T> \| null` | The prototype of the object, or `null` if it has none. |

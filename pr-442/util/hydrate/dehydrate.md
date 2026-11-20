# dehydrate()

- Kind: function
- Import: `import { dehydrate } from "shelving/util/hydrate";`

Deeply dehydrate a class instance based on a set of `Hydrations`
- Dehydration allows you to pass class instances from a server back to a client.
- By its nature dehydration is an unsafe operation.
- Deeply iterates into arrays and plain objects to dehydrate their items and props too.
- Note: the recursion in this function does not currently protect against infinite loops.

## Signatures

```ts
dehydrate(value: unknown, hydrations: Hydrations): unknown
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to dehydrate. |
| `hydrations` | `Hydrations` | The set of `$type` keys mapped to the class constructors used to recognise instances. |

## Returns

| Type | Description |
| --- | --- |
| `unknown` | The dehydrated version of the specified value. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `ValueError` If the value is a class instance that cannot be dehydrated (i.e. is not matched by any constructor in `hydrations`). |

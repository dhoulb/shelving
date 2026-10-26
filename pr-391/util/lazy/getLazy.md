# getLazy()

- Kind: function
- Import: `import { getLazy } from "shelving/util/lazy";`

Initialise a lazy value.
- If `value` is a plain value, that value is returned.
- If `value` is a function, it is called with `args` and its returned value is returned.

## Signatures

```ts
getLazy(value: (...args: A) => T, ...args: A): T
getLazy(value: Lazy<T, A>, ...args: A): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `(...args: A) => T` | The lazy value to resolve. |
| `args` | `A` | Any additional arguments passed into the initialiser function as its parameters. |
| `value` | `Lazy<T, A>` |  |
| `args` | `A` |  |

## Returns

| Type | Description |
| --- | --- |
| `T` | The resolved value. |
| `T` |  |

## Examples

```ts
getLazy(() => 123) // 123
```

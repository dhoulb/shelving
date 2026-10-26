# useLazy()

- Kind: function
- Import: `import { useLazy } from "shelving/react";`

Use a memoised value with lazy initialisation.
- Returns `value` (if not a function) or the result of calling `value(...args)` (if a function).
- Returns same `value` for as long as `args` is equal to previous `args`.

Compute a value once and recompute it only when its arguments change (by deep equality of the argument list). If the first argument is a function it is called with the remaining arguments; otherwise the value is returned as-is.

`useLazy` is the factory-call counterpart to `useInstance()` — use it when you have a plain function rather than a class constructor.

## Usage

```tsx
import { useLazy } from "shelving/react";

const sorted = useLazy((items) => [...items].sort(), items);
```

The result is recomputed only when `items` changes. Because arguments are compared by deep equality, a value that is equal-but-not-identical across renders does not trigger recomputation.


## Signatures

```ts
useLazy(value: (...args: A) => T, ...args: A): T
useLazy(value: T, ...args: Arguments): T
useLazy(value: Lazy<T, A>, ...args: A): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `(...args: A) => T` | Value to return, or a function called with `args` to lazily produce it. |
| `args` | `A` | Arguments passed to `value()` when it is a function — a change in `args` recomputes the value. |
| `value` | `T` |  |
| `args` | `Arguments` |  |
| `value` | `Lazy<T, A>` |  |
| `args` | `A` |  |

## Returns

| Type | Description |
| --- | --- |
| `T` |  |

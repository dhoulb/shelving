# useReduce()

- Kind: function
- Import: `import { useReduce } from "shelving/react";`

Use memoised value with reduction logic.
- Calls `reduce()` on each render.
- First argument `previous` is either `undefined` (on first render) or the value returned by `reduce()` on the previous render (on subsequent renders).
- `reduce()` can implement custom logic to decide whether to return the previous value or a new one.
- Returns whatever `reduce()` returns on this render.

Run a reducer on every render, passing it the value returned on the previous render. This lets you implement custom memoisation — deciding render by render whether to keep the previous reference or adopt a new one.

On the first render the reducer's `previous` argument is `undefined`; on every later render it is whatever the reducer returned last time.

## Usage

`useReduce` runs a reducer on every render, receiving the previous return value so you can implement custom equality logic:

```tsx
import { useReduce } from "shelving/react";
import { isDeepEqual } from "shelving/util";

const stable = useReduce((prev, next) => {
  if (prev && isDeepEqual(prev, next)) return prev; // Preserve reference if equal.
  return next;
}, incoming);
```

Here `stable` keeps the same reference for as long as the incoming value is deeply equal, even though `incoming` is a fresh object each render.


## Signatures

```ts
useReduce(reduce: (previous: T | undefined, ...a: A) => T, ...args: A): T
useReduce(reduce: (previous: T | undefined, ...a: A) => T | undefined, ...args: A): T | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `reduce` | `(previous: T \| undefined, ...a: A) => T` | Reducer called on every render with the previous result and `args`; returns this render's value. |
| `args` | `A` | Additional arguments forwarded to `reduce()` after `previous`. |
| `reduce` | `(previous: T \| undefined, ...a: A) => T \| undefined` |  |
| `args` | `A` |  |

## Returns

| Type | Description |
| --- | --- |
| `T` |  |
| `T \| undefined` |  |

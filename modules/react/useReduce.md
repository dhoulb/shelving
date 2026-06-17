# useReduce

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

## See also

- [`useLazy()`](/react/useLazy) — memoise a factory call by deep-equality of its arguments.
- [react](/react) — overview of all React hooks and context helpers.

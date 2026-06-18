# useLazy

Compute a value once and recompute it only when its arguments change (by deep equality of the argument list). If the first argument is a function it is called with the remaining arguments; otherwise the value is returned as-is.

`useLazy` is the factory-call counterpart to [`useInstance`](/react/useInstance) — use it when you have a plain function rather than a class constructor.

## Usage

```tsx
import { useLazy } from "shelving/react";

const sorted = useLazy((items) => [...items].sort(), items);
```

The result is recomputed only when `items` changes. Because arguments are compared by deep equality, a value that is equal-but-not-identical across renders does not trigger recomputation.

## See also

- [`useInstance()`](/react/useInstance) — the same memoisation for a class constructor call.
- [`useReduce()`](/react/useReduce) — fold render state with custom equality logic.
- [`shelving/react`](/react) — overview of all React hooks and context helpers.

# useSequence

Subscribe to an `AsyncIterable` for the lifetime of the component and return its most recent value. The subscription is recreated whenever the iterable reference changes, so memoise the iterable to keep the subscription stable.

The return value is `undefined` until the first emission. If the sequence throws, the error is re-thrown during render so the nearest error boundary catches it.

## Usage

```tsx
import { useSequence } from "shelving/react";

function LiveCounter({ counter }: { counter: AsyncIterable<number> }) {
  const count = useSequence(counter); // undefined until first emission.
  return <span>{count ?? "—"}</span>;
}
```

Because the subscription resets when the iterable reference changes, pass a stable reference — hoist it, or memoise it with [`useLazy`](/react/useLazy) / [`useInstance`](/react/useInstance) — to avoid resubscribing on every render.

## See also

- [useStore](/react/useStore) — subscribe to a Shelving `Store` with Suspense support.
- [react](/react) — overview of all React hooks and context helpers.

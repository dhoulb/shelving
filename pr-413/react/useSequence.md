# useSequence()

- Kind: function
- Import: `import { useSequence } from "shelving/react";`

Subscribe to an async iterable for the lifetime of the component.
- Re-renders the component with each value yielded by the sequence.

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

Because the subscription resets when the iterable reference changes, pass a stable reference — hoist it, or memoise it with `useLazy()` / `useInstance()` — to avoid resubscribing on every render.


## Signatures

```ts
useSequence(sequence?: AsyncIterable<T>): T | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `sequence` | `AsyncIterable<T>` | An object implementing the `AsyncIterable` interface. - Subscription is recreated every time this value changes. - Memoise this value to persist the subscription for the lifetime of the component. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `T \| undefined` |  |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | unknown Re-throws (during render) any error thrown by the sequence, for an error boundary to catch. |

# useSequenceTransition()

- Kind: function
- Import: `import { useSequenceTransition } from "shelving/react";`

Subscribe to an async iterable, and set each value it yields inside a React transition.
- Like `useSequence()`, but each value is set with `setState()` inside `startTransition()`, with a transition type, so a `<ViewTransition>` runs for it.
- It uses `useState()` and not `useSyncExternalStore()`, because React always renders a `useSyncExternalStore()` update at once, outside any transition.
- The transition type is shared by the whole React root: the next transition commit takes every type that is waiting.

Subscribe to an `AsyncIterable` and set each value it yields inside a React transition, with a transition type. A `<ViewTransition>` (or a `<Transition>` such as `<HorizontalTransition>`) around the content that reads the value then animates each change. `<Navigation>` uses it to slide pages.

**Things to know:**

- It uses `useState()`, not `useSyncExternalStore()`. React always renders a `useSyncExternalStore()` update at once, outside any transition, so a store read can never animate.
- `current` gives the first value, and is read again when the subscription starts, to catch up on values sent before it started.
- `transition` is a fixed type, or a function that returns the type for each value. A value with no type is set at once, with no transition.
- `equal` skips a value that is the same as the value shown, so it starts no second transition. It defaults to `Object.is`.
- Transition types belong to the whole React root: the next transition commit takes every type that is waiting.
- If the sequence throws, the error is re-thrown during render, so the nearest error boundary catches it.
- Memoise the iterable. The subscription restarts when the iterable changes.

## Usage

```tsx
import { useSequenceTransition } from "shelving/react";
import { ViewTransition } from "react";

function Slides({ slides }: { slides: SlideSequence }) {
	const slide = useSequenceTransition(slides, {
		current: () => slides.current,
		transition: s => s.direction, // "forward", "back", or undefined for no animation
		equal: (a, b) => a.id === b.id,
	});
	return (
		<ViewTransition update={{ forward: "slide-forward", back: "slide-back", default: "none" }}>
			<Slide slide={slide} />
		</ViewTransition>
	);
}
```


## Signatures

```ts
useSequenceTransition(sequence: AsyncIterable<T>, options: SequenceTransitionOptions<T>): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `sequence` | `AsyncIterable<T>` | An object implementing the `AsyncIterable` interface. - Subscription is recreated every time this value changes. - Memoise this value to persist the subscription for the lifetime of the component. |
| `options` | `SequenceTransitionOptions<T>` |  |
| `.current` | `() => T` | Read the current value. - Called for the first render, and again when the subscription starts, to catch up on values sent before it started. Read only. |
| `.transition` | `string \| ((value: T) => string \| null \| undefined) \| undefined` | Transition type for a value, or a fixed type for every value. - A value with a type is set inside `startTransition()` with that type, so a `<ViewTransition>` can animate it. - A value with no type (`undefined` or `null`) is set at once, with no transition. Read only. Optional. |
| `.equal` | `((a: T, b: T) => boolean) \| undefined` | Is a new value the same as the shown value? A value that is the same is skipped, so it starts no second transition. Read only. Defaults to `Object.is`. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The value shown now. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | unknown Re-throws (during render) any error thrown by the sequence, for an error boundary to catch. |

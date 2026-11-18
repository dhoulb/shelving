# useSequenceTransition

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

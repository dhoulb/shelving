/// <reference types="react/canary" />
import { addTransitionType, startTransition, useEffect, useRef, useState } from "react";
import { runSequence } from "../util/sequence.js";

/**
 * Options for `useSequenceTransition()`.
 *
 * @see https://shelving.cc/react/SequenceTransitionOptions
 */
export interface SequenceTransitionOptions<T> {
	/**
	 * Read the current value.
	 * - Called for the first render, and again when the subscription starts, to catch up on values sent before it started.
	 */
	readonly current: () => T;
	/**
	 * Transition type for a value, or a fixed type for every value.
	 * - A value with a type is set inside `startTransition()` with that type, so a `<ViewTransition>` can animate it.
	 * - A value with no type (`undefined` or `null`) is set at once, with no transition.
	 */
	readonly transition?: string | ((value: T) => string | null | undefined) | undefined;
	/**
	 * Is a new value the same as the shown value? A value that is the same is skipped, so it starts no second transition.
	 *
	 * @default Object.is
	 */
	readonly equal?: ((a: T, b: T) => boolean) | undefined;
	/**
	 * Wait before a value with a transition type is set, for example until the on-screen keyboard is down.
	 * - Return a promise to wait for it, or nothing to set the value at once.
	 * - A newer value that arrives while it waits wins: the older value is never set.
	 * - Values with no transition type never wait.
	 */
	readonly wait?: ((value: T) => PromiseLike<void> | void) | undefined;
}

/**
 * Subscribe to an async iterable, and set each value it yields inside a React transition.
 * - Like `useSequence()`, but each value is set with `setState()` inside `startTransition()`, with a transition type, so a `<ViewTransition>` runs for it.
 * - It uses `useState()` and not `useSyncExternalStore()`, because React always renders a `useSyncExternalStore()` update at once, outside any transition.
 * - The transition type is shared by the whole React root: the next transition commit takes every type that is waiting.
 *
 * @param sequence An object implementing the `AsyncIterable` interface.
 * - Subscription is recreated every time this value changes.
 * - Memoise this value to persist the subscription for the lifetime of the component.
 * @returns The value shown now.
 * @throws unknown Re-throws (during render) any error thrown by the sequence, for an error boundary to catch.
 * @see https://shelving.cc/react/useSequenceTransition
 */
export function useSequenceTransition<T>(sequence: AsyncIterable<T>, options: SequenceTransitionOptions<T>): T {
	const [value, setValue] = useState<T>(options.current);
	const [error, setError] = useState<unknown>(undefined);

	// Keep the latest options and value without starting a new subscription.
	const optionsRef = useRef(options);
	optionsRef.current = options;
	const valueRef = useRef(value);

	useEffect(() => {
		// Counts the values, so a value that waited is set only when no newer value came in while it waited.
		let count = 0;
		const set = (next: T) => {
			const { transition, equal = Object.is, wait } = optionsRef.current;
			if (equal(valueRef.current, next)) return;
			valueRef.current = next;
			const n = ++count;
			const type = typeof transition === "function" ? transition(next) : transition;
			if (!type) return setValue(next);
			const show = () => {
				if (n !== count) return;
				startTransition(() => {
					addTransitionType(type);
					setValue(next);
				});
			};
			const waiting = wait?.(next);
			if (waiting) waiting.then(show, show);
			else show();
		};
		set(optionsRef.current.current());
		return runSequence(sequence, set, setError);
	}, [sequence]);

	if (error) throw error;
	return value;
}

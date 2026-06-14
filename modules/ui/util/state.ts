import { useEffect, useRef, useState } from "react";

/**
 * Hold a piece of state that only updates after a debounce delay since the last set.
 *
 * - The state changes only once `delay` milliseconds have elapsed with no further sets — useful for waiting until a user stops typing before reacting.
 *
 * @param initial The initial state value.
 * @param delay The debounce delay in milliseconds (defaults to `500`).
 * @returns A `[state, setState]` tuple, where `setState` defers the update by `delay`.
 * @example const [query, setQuery] = useDebouncedState("");
 * @see https://dhoulb.github.io/shelving/ui/util/state/useDebouncedState
 */
export function useDebouncedState<T>(initial: T, delay = 500): [T, (v: T) => void] {
	const [state, setState] = useState(initial);
	const _internal = (useRef<{ timeout: NodeJS.Timeout | null; setDebouncedState: (v: T) => void }>(undefined).current ??= {
		timeout: null,
		setDebouncedState(v: T) {
			if (_internal.timeout) clearTimeout(_internal.timeout);
			_internal.timeout = setTimeout(() => setState(v), delay);
		},
	});
	return [state, _internal.setDebouncedState];
}

/**
 * Wrap a callback so it only runs after a debounce delay since the last invocation.
 *
 * - Each call resets the timer, so the callback fires once `delay` milliseconds have passed without another call — useful for auto-submitting a form after the user stops typing.
 * - Pending timeouts are cleared automatically on unmount.
 *
 * @param callback The callback to debounce (may be `undefined` to no-op).
 * @param delay The debounce delay in milliseconds (defaults to `500`).
 * @returns A debounced function that schedules `callback` after `delay`.
 * @example const submit = useDebouncedCallback(() => form.submit());
 * @see https://dhoulb.github.io/shelving/ui/util/state/useDebouncedCallback
 */
export function useDebouncedCallback(callback: (() => void) | undefined, delay = 500): () => void {
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const callbackRef = useRef(callback);

	// Keep callback ref up to date
	callbackRef.current = callback;

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	return () => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		if (callbackRef.current) {
			timeoutRef.current = setTimeout(() => callbackRef.current?.(), delay);
		}
	};
}

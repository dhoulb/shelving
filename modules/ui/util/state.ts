import { useEffect, useRef, useState } from "react";

/**
 * Set a state using a "debounce" delay — this ensures that the state is only updated after the specified delay has passed since the last update.
 * - Useful for input fields where you want to wait until the user has stopped typing before performing an action (e.g., API call).
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
 * Debounce a callback function — the callback will only be invoked after the specified delay has passed since the last call.
 * - Useful for triggering form submissions after the user has stopped typing.
 * - Automatically cleans up pending timeouts on unmount.
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

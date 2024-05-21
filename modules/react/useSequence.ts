import { useEffect, useState } from "react";
import { runSequence } from "../util/sequence.js";

/**
 * Subscribe to an async iterable for the lifetime of the component.
 *
 * @param sequence An object implementing the `AsyncIterable` interface.
 * - Subscription is recreated every time this value changes.
 * - Memoise this value to persist the subscription for the lifetime of the component.
 */
export function useSequence<T>(sequence?: AsyncIterable<T>): T | undefined {
	const [value, setValue] = useState<T | undefined>(undefined);
	const [error, setError] = useState<unknown>(undefined);
	useEffect(() => {
		if (sequence) return runSequence(sequence, setValue, setError);
	}, [sequence]);
	if (error) throw error;
	return value;
}

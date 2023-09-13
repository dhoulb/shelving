import { useEffect, useState } from "react";
import { BLACKHOLE } from "../util/function.js";
import { runSequence } from "../util/sequence.js";

/**
 * Subscribe to an async iterable.
 *
 * @param sequence An object implementing the `AsyncIterable` interface.
 * - Subscription is recreated every time this value changes.
 * - Memoise this value to persist the subscription for the lifetime of the component.
 */
export function useSequence<T>(sequence?: AsyncIterable<T>): T | undefined {
	const [value, setValue] = useState<T | undefined>(undefined);
	const [error, setError] = useState<unknown>(undefined);
	useEffect(sequence ? () => runSequence(sequence, setValue, setError) : BLACKHOLE, [sequence]);
	if (error) throw error;
	return value;
}

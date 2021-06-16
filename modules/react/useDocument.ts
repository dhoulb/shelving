import { Data, Document, Result, State } from "..";
import { useState } from "./useState";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UNDEFINED_STATE = new State<any>(undefined);

/**
 * Use a single document in a React component.
 *
 * @param ref Shelving `Document` reference, or an explicit `undefined`
 * - If `document` is `undefined` then `undefined` will always be returned.
 * @param maxAgeMs How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created.
 *
 * @returns `State` instance for the result of the document.
 * - `state.value` of the state allows you to read the data.
 * - `state.data` allows you to read the data but throws a `RequiredError` if it was `undefined`
 * - If the data hasn't loaded yet, reading `state.value` will throw a `Promise` which can be caught by a `<Suspense />` element.
 *   - `state.loading` can tell you if the data is still loading before you read `state.value`
 * - If the data results in an error, reading `state.value` will throw that error.
 *   - `state.reason` can tell you if the state has an error before you read `state.value`
 */
export const useDocument = <T extends Data>(ref: Document<T> | undefined, maxAge: number | true = 1000): State<Result<T>> => {
	const state: State<Result<T>> = ref ? ref.state : UNDEFINED_STATE;
	if (ref && !state.closed) {
		if (maxAge === true) {
			// Start a source subscription on the state if there isn't one.
			if (!state.started) {
				// Start a subscription to the reference.
				state.start(ref);
				// If the state doesn't have any subscribers in a few seconds, stop the subscription again.
				setTimeout(() => !state.subscribers && state.stop(), 5000);
			}
		} else {
			// Get the next value from the ref if there's no subscription and the current one is too old.
			if (!state.started && !state.pending && state.age < maxAge) state.next(ref.result);
		}
	}
	useState(state);
	return state;
};

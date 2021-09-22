import { Data, Document, Unsubscriber, DocumentState } from "..";
import { usePureEffect } from "./usePureEffect";
import { useObserve } from "./useObserve";

/**
 * Use a single document in a React component.
 * - Requires database to use `StateProvider` and will error if this does not exist.
 *
 * @param ref Shelving `Document` reference, or an explicit `undefined`
 * - If `document` is `undefined` then `undefined` will always be returned.
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
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
export function useDocument<T extends Data>(ref: Document<T>, maxAge?: number | true): DocumentState<T>;
export function useDocument(ref: undefined, maxAge?: number | true): undefined;
export function useDocument<T extends Data>(ref: Document<T> | undefined, maxAge?: number | true): DocumentState<T> | undefined;
export function useDocument<T extends Data>(ref: Document<T> | undefined, maxAge: number | true = 1000): DocumentState<T> | undefined {
	const state = ref?.state;
	if (state) state.refresh(maxAge); // If we have a `DocumentState` refresh it if it's outdated.
	usePureEffect(realtimeEffect, [state, maxAge]);
	useObserve(state);
	return state;
}

/** Effect that keeps the realtime subscription alive (if `maxAge` is `true`) for the lifespan of the component. */
const realtimeEffect = <T extends Data>(state: DocumentState<T> | undefined, maxAge: number | true): Unsubscriber | void =>
	state && maxAge === true ? state.start() : undefined;

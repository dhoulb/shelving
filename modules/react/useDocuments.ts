import { Data, Documents, Unsubscriber, DocumentsState } from "..";
import { usePureEffect } from "./usePureEffect";
import { useObserve } from "./useObserve";

/**
 * Use a set of documents in a React component.
 * - Requires database to use `StateProvider` and will error if this does not exist.
 *
 * @param ref Shelving `Documents` reference, or an explicit `undefined`
 * - If `collection` is `undefined` then `{}` empty results will always be returned.
 * @param maxAge How 'out of date' data is allowed to be before it'll be refetched.
 * - If `maxAge` is true, a realtime subscription to the data will be created.
 *
 * @returns `State` instance for the results of the collection.
 * - `state.value` of the state allows you to read the data.
 * - If the data hasn't loaded yet, reading `state.value` will throw a `Promise` which can be caught by a `<Suspense />` element.
 *   - `state.loading` can tell you if the data is still loading before you read `state.value`
 * - If the data results in an error, reading `state.value` will throw that error.
 *   - `state.reason` can tell you if the state has an error before you read `state.value`
 */
export function useDocuments<T extends Data>(ref: Documents<T>, maxAge?: number | true): DocumentsState<T>;
export function useDocuments(ref: undefined, maxAge?: number | true): undefined;
export function useDocuments<T extends Data>(ref: Documents<T> | undefined, maxAge?: number | true): DocumentsState<T> | undefined;
export function useDocuments<T extends Data>(ref: Documents<T> | undefined, maxAge: number | true = 1000): DocumentsState<T> | undefined {
	const state = ref?.state;
	if (state) state.refreshOutdated(maxAge); // If we have a `DocumentsState` refresh it if it's outdated.
	usePureEffect(realtimeEffect, [state, maxAge]);
	useObserve(state);
	return state;
}

/** Effect that keeps the realtime subscription alive (if `maxAge` is `true`) for the lifespan of the component. */
const realtimeEffect = <T extends Data>(state: DocumentsState<T> | undefined, maxAge: number | true): Unsubscriber | void =>
	state && maxAge === true ? state.start() : undefined;

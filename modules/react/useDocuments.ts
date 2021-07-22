import { Data, Results, Documents, assertInstance, State, StateProvider, Unsubscriber } from "..";
import { usePureEffect } from "./usePureEffect";
import { usePureMemo } from "./usePureMemo";
import { useState } from "./useState";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EMPTY_STATE = new State<Results<any>>({});

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
export const useDocuments = <T extends Data>(ref: Documents<T> | undefined, maxAge: number | true = 1000): State<Results<T>> => {
	let state: State<Results<T>> = EMPTY_STATE;

	if (ref) {
		const provider = ref.db.provider;
		assertInstance(provider, StateProvider);
		state = provider.getDocumentsState<T>(ref);
		provider.refreshDocumentsState(ref, maxAge);
	}

	// Subscribe to the state so when it changes the component is rerendered.
	useState(state);

	// Keep any realtime subscriptions open for the lifespan of this component.
	usePureEffect(subscribeEffect, [usePureMemo(ref, [ref?.path]), maxAge]);

	return state;
};

/** Effect that keeps the realtime subscription (if `maxAge` is `true`) open for the lifespan of the component. */
const subscribeEffect = <T extends Data>(ref: Documents<T> | undefined, maxAge: number | true): Unsubscriber | void =>
	ref && maxAge === true ? () => ref.subscribe({}) : undefined;

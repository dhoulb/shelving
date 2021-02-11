import { assert, assertLength } from "../assert";
import { Data, Results } from "../data";
import { Collection } from "../db";
import { dispatch, EmptyDispatcher } from "../dispatch";
import { getLastProp } from "../object";
import { createState, State } from "../state";

type PaginationState<T extends Data> = {
	loading: boolean;
	done: boolean;
	results: Results<T>;
	next: EmptyDispatcher;
};

/**
 * Wrap a `Collection` to enable pagination.
 *
 * Returns a `State` instance containing:
 * - `.results` which contains the combined results of the pages.
 * - `.done` which tells us whether we reached the end of the query.
 * - `.loading` which tells us if the query is loading or not.
 * - `.next()` which lets us load the next page and add it into the results.
 *
 * To use this in a React component, use `useLazy(createPaginationState, [collection])`
 * Or, to persist the state, use `useFetch(createPaginationState, [collection])`
 *
 * @param collection Collection instance to query on. Must have a limit and at least one sort order.
 */
export const createPaginationState = <T extends Data>(collection: Collection<T>, initialResults: Results<T> = {}): State<PaginationState<T>> => {
	const { slice, sorts } = collection.query;
	const limit = slice.limit;
	assert(limit, limit); // Collection must have a limit to paginate (otherwise you'd just get the result normally).
	assertLength(sorts, 1, Infinity); // Collection must have at least one sort order to paginate.

	const _loadMore = async () => {
		const { loading, done, results, next } = state.value;
		if (loading || done) return;

		state.update({ loading: true });

		const lastEntry = getLastProp(results);
		const offsetCollection = lastEntry ? collection.after(...lastEntry) : collection;
		const additionalResults = await offsetCollection.results;
		const length = Object.keys(results).length;

		state.set({
			loading: false,
			done: length < limit,
			results: { ...results, ...additionalResults },
			next,
		});
	};

	const state = createState<PaginationState<T>>({
		loading: false,
		done: false,
		results: initialResults,
		next: () => dispatch(_loadMore, undefined),
	});

	return state;
};

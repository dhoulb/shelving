import type { QueryReference } from "../db/Reference.js";
import type { Data, Entity } from "../util/data.js";
import { PaginationState } from "../db/PaginationState.js";
import { isSameReference } from "../db/util.js";
import { getArray } from "../util/array.js";
import { useReduce } from "./useReduce.js";
import { useSubscribe } from "./useSubscribe.js";

/**
 * Use a `Pagination` for a collection.
 * - Doesn't persist the state, so if the component or anything beneath it throws the currently paginated results will be lost.
 */
export function usePagination<T extends Data>(ref: QueryReference<T>, initial?: Iterable<Entity<T>>): PaginationState<T> {
	const pagination = useReduce(_getPagination, ref, initial);
	useSubscribe(pagination);
	return pagination;
}

/** Get a `PaginationState` for a query reference. */
function _getPagination<T extends Data>(previous: PaginationState<T> | undefined, ref: QueryReference<T>, initial?: Iterable<Entity<T>>): PaginationState<T> {
	// If there's a previous `PaginationState` reuse it as long as the ref hasn't change.
	if (previous && isSameReference(previous.ref, ref)) return previous;
	// Make and return a new `PaginationState`
	const state = new PaginationState(ref);
	if (initial) state.next(getArray(initial));
	return state;
}

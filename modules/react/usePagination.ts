import { QueryReference, Results, PaginationState, Data, initialState, isSameReference } from "../index.js";
import { useSubscribe } from "./useSubscribe.js";
import { useReduce } from "./useReduce.js";

/**
 * Use a `Pagination` for a collection.
 * - Doesn't persist the state, so if the component or anything beneath it throws the currently paginated results will be lost.
 */
export function usePagination<T extends Data>(ref: QueryReference<T>, initial?: Results<T>): PaginationState<T> {
	const pagination = useReduce(_getPagination, ref, initial);
	useSubscribe(pagination);
	return pagination;
}

/** Get a `PaginationState` for a query reference. */
function _getPagination<T extends Data>(previous: PaginationState<T> | undefined, ref: QueryReference<T>, initial?: Results<T>): PaginationState<T> {
	// If there's a previous `PaginationState` reuse it as long as the ref hasn't change.
	if (previous && isSameReference(previous.ref, ref)) return previous;
	// Make and return a new `PaginationState`
	return initial ? initialState(initial, new PaginationState(ref)) : new PaginationState(ref);
}

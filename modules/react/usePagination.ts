import { DatabaseQuery, Results, Data, PaginationState } from "../index.js";
import { useSubscribable } from "./useSubscribe.js";
import { usePureMemo } from "./usePureMemo.js";

/**
 * Use a `Pagination` for a collection.
 * - Doesn't persist the state, so if the component or anything beneath it throws the currently paginated results will be lost.
 */
export const usePagination = <T extends Data>(ref: DatabaseQuery<T>, initial?: Results<T>): PaginationState<T> => {
	const pagination = usePureMemo<PaginationState<T>, [DatabaseQuery<T>, Results<T> | undefined]>(
		PaginationState,
		usePureMemo(ref, [ref.toString()]),
		initial,
	);
	useSubscribable(pagination);
	return pagination;
};

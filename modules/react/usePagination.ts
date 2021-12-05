import { DataQuery, ResultsMap, Pagination, Data } from "../index.js";
import { useSubscribe } from "./useSubscribe.js";
import { usePureMemo } from "./usePureMemo.js";

/**
 * Use a `Pagination` for a collection.
 * - Doesn't persist the state, so if the component or anything beneath it throws the currently paginated results will be lost.
 */
export function usePagination<T extends Data>(ref: DataQuery<T>, initial?: ResultsMap<T>): Pagination<T> {
	const pagination = usePureMemo(createPagination, usePureMemo(ref, [ref.toString()]), initial);
	useSubscribe(pagination);
	return pagination;
}

function createPagination<T extends Data>(ref: DataQuery<T>, initial?: ResultsMap<T>) {
	const pagination = new Pagination(ref);
	if (initial) pagination.next(initial);
	return pagination;
}

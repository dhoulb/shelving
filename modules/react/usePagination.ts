import { DatabaseQuery, Results, Pagination, Data } from "../index.js";
import { useSubscribe } from "./useSubscribe.js";
import { useLazy } from "./useLazy.js";

/**
 * Use a `Pagination` for a collection.
 * - Doesn't persist the state, so if the component or anything beneath it throws the currently paginated results will be lost.
 */
export function usePagination<T extends Data>(ref: DatabaseQuery<T>, initial?: Results<T>): Pagination<T> {
	const pagination = useLazy(_createPagination, useLazy(ref, [ref.toString()]), initial);
	useSubscribe(pagination);
	return pagination;
}

function _createPagination<T extends Data>(ref: DatabaseQuery<T>, initial?: Results<T>) {
	const pagination = new Pagination(ref);
	if (initial) pagination.next(initial);
	return pagination;
}

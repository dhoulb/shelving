import { DatabaseQuery, ResultsMap, Pagination, Datas, Key } from "../index.js";
import { useSubscribe } from "./useSubscribe.js";
import { usePureMemo } from "./usePureMemo.js";

/**
 * Use a `Pagination` for a collection.
 * - Doesn't persist the state, so if the component or anything beneath it throws the currently paginated results will be lost.
 */
export function usePagination<D extends Datas, C extends Key<D>>(ref: DatabaseQuery<C, D>, initial?: ResultsMap<D[C]>): Pagination<C, D> {
	const pagination = usePureMemo(createPagination, usePureMemo(ref, [ref.toString()]), initial);
	useSubscribe(pagination);
	return pagination;
}

function createPagination<D extends Datas, C extends Key<D>>(ref: DatabaseQuery<C, D>, initial?: ResultsMap<D[C]>) {
	const pagination = new Pagination(ref);
	if (initial) pagination.next(initial);
	return pagination;
}

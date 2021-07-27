import { Documents, Results, Data, PaginationState } from "..";
import { usePureMemo } from "./usePureMemo";
import { useState } from "./useState";

/**
 * Use a `Pagination` for a collection.
 * - Doesn't persist the state, so if the component or anything beneath it throws the state will be lost.
 */
export const usePagination = <T extends Data>(ref: Documents<T>, initial?: Results<T>): PaginationState<T> => {
	const pagination = usePureMemo<PaginationState<T>, [Documents<T>, Results<T> | undefined]>(createPagination, [usePureMemo(ref, [ref.toString()]), initial]);
	useState(pagination);
	return pagination;
};

/** Create a new `Pagination` instance. */
const createPagination = <T extends Data>(ref: Documents<T>, initial?: Results<T>): PaginationState<T> => new PaginationState<T>(ref, initial);

import { Documents, Results, Data, Pagination } from "..";
import { usePureMemo } from "./usePureMemo";
import { useState } from "./useState";

/**
 * Use a `Pagination` for a collection.
 * - Doesn't persist the state, so if the component or anything beneath it throws the state will be lost.
 */
export const usePagination = <T extends Data>(ref: Documents<T>, initial?: Results<T>): Pagination<T> => {
	const pagination = usePureMemo<Pagination<T>, [Documents<T>, Results<T> | undefined]>(createPagination, [usePureMemo(ref, [ref.toString()]), initial]);
	useState(pagination);
	return pagination;
};

/** Create a new `Pagination` instance. */
const createPagination = <T extends Data>(ref: Documents<T>, initial?: Results<T>): Pagination<T> => new Pagination<T>(ref, initial);

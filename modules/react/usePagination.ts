import { useRef } from "react";
import { Documents, Results, Data } from "..";
import { Pagination } from "./Pagination";
import { useState } from "./useState";

/**
 * Use a `Pagination` for a collection.
 * - Doesn't persist the state, so if the component or anything beneath it throws the state will be lost.
 */
export const usePagination = <T extends Data>(ref: Documents<T>, initial?: Results<T>): Pagination<T> => {
	const internals: {
		pagination: Pagination<T>;
	} = (useRef<{
		pagination: Pagination<T>;
	}>().current ||= {
		pagination: Pagination.for(ref, initial),
	});
	if (internals.pagination.toString() !== ref.toString()) internals.pagination = Pagination.for(ref, initial);
	const { pagination } = internals;
	useState(pagination);
	return pagination;
};

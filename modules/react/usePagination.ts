import { useRef } from "react";
import { Collection, Results, Data, Pagination } from "..";
import { useState } from "./useState";

/**
 * Use a `Pagination` for a collection.
 * - Doesn't persist the state, so if the component or anything beneath it throws the state will be lost.
 */
export const usePagination = <T extends Data>(collection: Collection<T>, initial?: Results<T>): Pagination<T> => {
	const internals: {
		pagination: Pagination<T>;
	} = (useRef<{
		pagination: Pagination<T>;
	}>().current ||= {
		pagination: Pagination.for(collection, initial),
	});
	if (internals.pagination.toString() !== collection.toString()) internals.pagination = Pagination.for(collection, initial);
	const { pagination } = internals;
	useState(pagination);
	return pagination;
};

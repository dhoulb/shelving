import { useRef } from "react";
import { Documents, Results, Data, Pagination } from "..";
import { useState } from "./useState";

/**
 * Use a `Pagination` for a collection.
 * - Doesn't persist the state, so if the component or anything beneath it throws the state will be lost.
 */
export const usePagination = <T extends Data>(ref: Documents<T>, initial?: Results<T>): Pagination<T> => {
	// Use a ref to hold the internal state.
	const internals: {
		pagination: Pagination<T>;
	} = (useRef<{
		pagination: Pagination<T>;
	}>().current ||= {
		pagination: new Pagination(ref, initial),
	});

	// If the references changes create a new pagination.
	if (internals.pagination.ref.toString() !== ref.toString()) internals.pagination = new Pagination(ref, initial);

	// Subscribe this component to the pagination.
	const { pagination } = internals;
	useState(pagination);
	return pagination;
};

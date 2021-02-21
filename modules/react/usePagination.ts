import { useRef } from "react";
import { Collection, Results, Data } from "..";
import { Pagination } from "../pagination";
import { useSubscribe } from "./useSubscribe";

/**
 * Use a `Pagination` for a collection.
 * - Doesn't persist the state, so if the component or anything beneath it throws the state will be lost.
 */
export const usePagination = <T extends Data>(collection: Collection<T>, initial?: Results<T>): Pagination<T> => {
	const ref = useRef<Pagination<T>>();
	if (!ref.current || ref.current.collection.toString() !== collection.toString()) {
		// Make a new pagination if the collection changes.
		ref.current = Pagination.for(collection, initial);
	}
	useSubscribe(ref.current);
	return ref.current;
};

import { Arguments, serialise, State, dispatchAsyncNext, AnyState } from "../index.js";
import { useSubscribe } from "./useSubscribe.js";

/** Store a list of named cached `State` instances. */
const sources = new Map<string, AnyState>();

/**
 * Fetch a value in a React component.
 *
 * @param fetcher Plain value or fetch function that returns a plain value or async/promised value.
 * @param deps Value the async value relies on like `useEffect()` and `useMemo()` etc. Deps are passed as the arguments to `fetch()` if it's a function.
 * @param maxAgeMs How 'out of date' data is allowed to be before it'll be refetched.
 *
 * @returns `State` instance for the results of the fetch.
 * - `state.value` of the state allows you to read the data.
 * - If the data hasn't loaded yet, reading `state.value` will throw a `Promise` which can be caught by a `<Suspense />` element.
 *   - `state.loading` can tell you if the data is still loading before you read `state.value`
 * - If the data results in an error, reading `state.value` will throw that error.
 *   - `state.reason` can tell you if the state has an error before you read `state.value`
 */
export function useFetch<T, A extends Arguments>(fetcher: (...args: A) => T | Promise<T>, deps: A, maxAge = 86400000): State<T> {
	const key = `${serialise(fetcher)}:${serialise(deps)}`;
	let state: State<T> | undefined = sources.get(key);

	if (!state) {
		// Create a new state and start a fetch.
		state = new State();
		sources.set(key, state);
		dispatchAsyncNext(fetcher(...deps), state);
	} else if (state.closed) {
		// Clean up source in a few seconds if it's closed.
		// The few seconds allow time for the component to render with the errored state so the error can be shown to the user.
		setTimeout(() => sources.get(key)?.closed && sources.delete(key), 3000);
	} else if (state.age > maxAge) {
		// Refetch if state has value and it's older than `maxAge`
		dispatchAsyncNext(fetcher(...deps), state);
	}

	useSubscribe(state);
	return state;
}

import { createLoadingSource, createSource, Source } from "..";

// How long to wait before removing errored sources.
const ERROR_CLEANUP_MS = 10000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sources: { [fingerprint: string]: Source<any> } = {
	"undefined": createSource(undefined),
	"{}": createSource({}),
};

/**
 * Get a cached source for use in a React element.
 * @todo This might need garbage collection in future.
 */
export const getCachedSource = <T>(key: string): Source<T> => {
	let source = sources[key];
	if (!source) {
		source = createLoadingSource<T>();
		source.subscribe({
			// If the source errors, remove it from the sources list after a delay.
			// This allows the source to be retried (e.g. if the error came from being offline, maybe we're online now).
			error: () => void setTimeout(() => delete sources[key], ERROR_CLEANUP_MS),
		});
		sources[key] = source;
	}
	return source;
};

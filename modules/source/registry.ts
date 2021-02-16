import { MutableObject } from "../object";
import { createSource, Source } from "./Source";

/** Global registry of sources indexed by key. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sources: MutableObject<Source<any>> = {
	// Undefined source always has a value of `undefined` empty object.
	"undefined": createSource(undefined),
	// Empty object source always has a value of `{}` empty object.
	"{}": createSource({}),
};

/** Get a named source by its key from the global registry of sources. */
export const getSource = <T>(key: string): Source<T> => (sources[key] ||= createSource<T>());

import type { AnyState, State } from "../state/State.js";
import type { Optional } from "../util/optional.js";
import { useCallback, useSyncExternalStore } from "react";
import { NONE } from "../util/constants.js";
import { BLACKHOLE } from "../util/function.js";
import { runSequence } from "../util/sequence.js";

export function useState<T extends AnyState>(state: T): T;
export function useState<T extends AnyState>(state?: Optional<T>): T | undefined;
export function useState<T>(state: Optional<State<T>>): State<T> | undefined {
	useSyncExternalStore(
		useCallback(onStateChange => (state ? runSequence(state, onStateChange, onStateChange) : BLACKHOLE), [state]),
		() => (!state ? state : state.loading ? NONE : state.value),
	);
	return state ?? undefined;
}

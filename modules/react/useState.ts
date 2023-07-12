import type { AnyState, State } from "../state/State.js";
import { useCallback, useSyncExternalStore } from "react";
import { NONE } from "../util/constants.js";
import { BLACKHOLE } from "../util/function.js";

export function useState<T extends AnyState>(state: T): T;
export function useState<T extends AnyState>(state?: T | undefined): T | undefined;
export function useState<T>(state: State<T> | undefined): State<T> | undefined {
	useSyncExternalStore(
		useCallback(onStateChange => state?.to(onStateChange, onStateChange) || BLACKHOLE, [state]),
		() => (!state ? state : state.loading ? NONE : state.value),
	);
	return state;
}

import type { AnyState, State } from "../state/State.js";
import type { Nullish } from "../util/null.js";
import { useCallback, useSyncExternalStore } from "react";
import { NONE } from "../util/constants.js";
import { BLACKHOLE } from "../util/function.js";

export function useState<T extends AnyState>(state: T): T;
export function useState<T extends AnyState>(state?: Nullish<T>): T | undefined;
export function useState<T>(state: Nullish<State<T>>): State<T> | undefined {
	useSyncExternalStore(
		useCallback(onStateChange => state?.to(onStateChange, onStateChange) || BLACKHOLE, [state]),
		() => (!state ? state : state.loading ? NONE : state.value),
	);
	return state ?? undefined;
}

import type { Arguments } from "../util/function.js";
import { useRef } from "react";
import { isArrayEqual } from "../util/equal.js";
import { type Start, Starter } from "../util/start.js";

export function useMount<T extends Element, A extends Arguments = []>(start: Start<[T, ...A]>, ...args: A): React.RefCallback<T> {
	const internals = (useRef<{
		args: A;
		current: T | null;
		readonly starter: Starter<[T, ...A]>;
		readonly ref: React.RefCallback<T>;
	}>().current ||= {
		args,
		current: null,
		starter: new Starter(start),
		ref(next: T | null) {
			if (internals.current !== next) {
				internals.starter.stop();
				internals.current = next;
				if (internals.current) internals.starter.start(internals.current, ...internals.args);
			}
		},
	});
	if (!isArrayEqual<A>(args, internals.args)) {
		internals.args = args;
		internals.starter.stop();
		if (internals.current) internals.starter.start(internals.current, ...internals.args);
	}
	return internals.ref;
}

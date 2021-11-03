import { useRef, useEffect as useReactEffect } from "react";
import { Arguments, Unsubscriber } from "../index.js";

/**
 * Version of React's `useEffect()` that allows the use of a pure (side-effect free) function.
 *
 * @param effect The function that powers the effect.
 * - When called, receives the set of `args` as its arguments.
 *
 * @param ...args Set of arguments that specify whether the effect is re-run or not.
 * - This array of values is passed _into_ the function as its parameters.
 * - This means you can create the function once (outside the component) rather than creating it on every render.
 * - This improves performance (though probably only noticeable on functions that render 1,000s of times).
 */
export function usePureEffect<A extends Arguments>(effect: (...a: A) => Unsubscriber | void, ...args: A): void {
	const internals: {
		memoed: () => Unsubscriber | void;
		effect: (...a: A) => Unsubscriber | void;
		args: A;
	} = (useRef<{
		memoed: () => Unsubscriber | void;
		effect: (...a: A) => Unsubscriber | void;
		args: A;
	}>().current ||= {
		memoed: () => internals.effect(...internals.args),
		effect,
		args,
	});
	internals.args = args;
	internals.effect = effect;
	useReactEffect(internals.memoed, args);
}

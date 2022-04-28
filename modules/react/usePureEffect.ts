import { useRef, useEffect } from "react";
import { Arguments, Unsubscriber } from "../index.js";

/**
 * Version of React's `useEffect()` that allows the use of a pure (side-effect free) function.
 *
 * @param effect The function that powers the effect.
 * @param ...args Set of arguments that specify whether the effect is re-run or not.
 * - This array of values is passed into the effect function as its parameters.
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
	useEffect(internals.memoed, args);
}

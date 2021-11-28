import { Deriver, LOADING, Observable, Subscribable, ObserverType } from "../util/index.js";
import { AbstractState } from "./AbstractState.js";
import { deriveStream } from "./DeriveStream.js";

/** Any state (useful for `extends AnySubscribable` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyState = State<any>;

/**
 * Simple state.
 * - Does no deriving (input and output types are the same).
 * - Promised next values are awaited before being dispatched to subscribers.
 * - `SKIP` is allowed as a next value in order to skip values.
 */
export class State<T> extends AbstractState<T, T> {
	// Input and output types are the same for a simple state.
	protected override _derive(value: T | typeof LOADING): void {
		if (value !== this._value) this._dispatch(value);
	}
}

/** Create a state with an initial value. */
export function initialState<T>(initial: T | typeof LOADING): State<T>;
export function initialState<T extends AnyState>(initial: ObserverType<T> | typeof LOADING, state: T): T;
export function initialState<T>(initial: T | typeof LOADING, state: State<T> = new State()): State<T> {
	state.next(initial);
	return state;
}

/** Subscribe from a source to a new or existing state. */
export function subscribeState<T extends AnyState>(source: Subscribable<ObserverType<T>>, target: T): T;
export function subscribeState<T>(source: Subscribable<T>): State<T>;
export function subscribeState<T>(source: Subscribable<T>, target: State<T> = new State()): State<T> {
	target.start(source);
	return target;
}

/** Derive from a source to a new or existing state using a deriver. */
export function deriveState<I, O extends AnyState>(source: Observable<I>, deriver: Deriver<I, ObserverType<O> | Promise<ObserverType<O>>>, target: O): O;
export function deriveState<I, O>(source: Observable<I>, deriver: Deriver<I, O | Promise<O>>): State<O>;
export function deriveState<I, O>(source: Observable<I>, deriver: Deriver<I, O | Promise<O>>, target: State<O> = new State()): State<O> {
	return deriveStream(source, deriver, target);
}

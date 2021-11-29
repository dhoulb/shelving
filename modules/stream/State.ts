import {
	Deriver,
	LOADING,
	Subscribable,
	ObserverType,
	NOERROR,
	Observer,
	dispatchNext,
	dispatchError,
	dispatchComplete,
	derive,
	getRequired,
	Mutable,
} from "../util/index.js";
import { deriveAsyncStream, deriveStream, Stream, startStream } from "./Stream.js";
import { getNextValue } from "./LimitStream.js";

/** Any state (useful for `extends AnySubscribable` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyState = State<any>;

/**
 * Stream that retains its most recent value
 * - Current value can be read at `state.value` and `state.data`
 * - States also send their most-recent value to any new subscribers immediately when a new subscriber is added.
 * - States can also be in a loading state where they do not have a current value.
 *
 * @param initial The initial value for the state, a `Promise` that resolves to the initial value, a source `Subscribable` to subscribe to, or another `State` instance to take the initial value from and subscribe to.
 * - To set the state to be loading, use the `LOADING` constant or a `Promise` value.
 * - To set the state to an explicit value, use that value or another `State` instance with a value.
 * */
export class State<T> extends Stream<T> {
	readonly reason: Error | unknown | typeof NOERROR = NOERROR;
	readonly updated: number | null = null;

	protected _value: T | typeof LOADING = LOADING;

	/** Age of the current value (in milliseconds). */
	get age(): number {
		return typeof this.updated === "number" ? Date.now() - this.updated : Infinity;
	}

	/** Most recently dispatched value (or throw `Promise` that resolves to the next value). */
	get value(): T {
		if (this.reason !== NOERROR) throw this.reason;
		if (this._value === LOADING) throw getNextValue(this);
		return this._value;
	}

	/** Get current required value (or throw `Promise` that resolves to the next required value). */
	get data(): Exclude<T, null | undefined> {
		if (this.reason !== NOERROR) throw this.reason;
		if (this._value === LOADING) throw getNextValue(this).then(getRequired);
		return getRequired(this._value);
	}

	/** Is there a current value, or is it still loading. */
	get loading(): boolean {
		return this._value === LOADING;
	}

	/** Apply a deriver to this state. */
	apply(deriver: Deriver<T, T>): void {
		this.next(derive(this.value, deriver));
	}

	// Override to save the reason at `this.reason` and clean up.
	override error(reason: Error | unknown): void {
		if (!this.closed) (this as Mutable<this>).reason = reason;
		super.error(reason);
	}

	// Override to send the current error or value to any new subscribers.
	override on(observer: Observer<T>) {
		super.on(observer);
		if (this.reason !== NOERROR) dispatchError(this.reason, observer);
		else if (this.closed) dispatchComplete(observer);
		else if (this._value !== LOADING) dispatchNext(this.value, observer);
	}

	// Dispatcher saves any values that are dispatched.
	protected override _dispatch(value: T) {
		this._value = value;
		(this as Mutable<this>).updated = Date.now();
		if (value !== this._value) super._dispatch(value);
	}
}

/** Create a state with an initial value. */
export function initialState<T>(initial: T): State<T>;
export function initialState<T extends AnyState>(initial: ObserverType<T>, state: T): T;
export function initialState<T>(initial: T, state: State<T> = new State()): State<T> {
	state.next(initial);
	return state;
}

/** Create a state that's subscribed to a source subscribable. */
export function startState<T extends AnyState>(source: Subscribable<ObserverType<T>>, target: T): T;
export function startState<T>(source: Subscribable<T>): State<T>;
export function startState<T>(source: Subscribable<T>, target: State<T> = new State()): State<T> {
	return startStream<State<T>>(source, target);
}

/** Derive from a source to a new or existing stream using a deriver. */
export function deriveState<I, O extends AnyState>(source: Subscribable<I>, deriver: Deriver<I, ObserverType<O>>, target: O): O;
export function deriveState<I, O>(source: Subscribable<I>, deriver: Deriver<I, O>): State<O>;
export function deriveState<I, O>(source: Subscribable<I>, deriver: Deriver<I, O>, target: State<O> = new State<O>()): State<O> {
	return deriveStream<I, State<O>>(source, deriver, target);
}

/** Derive from a source to a new or existing stream using an async deriver. */
export function deriveAsyncState<I, O extends AnyState>(source: Subscribable<I>, deriver: Deriver<I, ObserverType<O> | Promise<ObserverType<O>>>, target: O): O; // prettier-ignore
export function deriveAsyncState<I, O>(source: Subscribable<I>, deriver: Deriver<I, O | Promise<O>>): State<O>;
export function deriveAsyncState<I, O>(source: Subscribable<I>, deriver: Deriver<I, O | Promise<O>>, target: State<O> = new State<O>()): State<O> {
	return deriveAsyncStream<I, State<O>>(source, deriver, target);
}

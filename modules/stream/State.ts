import {
	Transformer,
	LOADING,
	ObserverType,
	NOERROR,
	Observer,
	dispatchNext,
	dispatchError,
	dispatchComplete,
	transform,
	Mutable,
	awaitNext,
} from "../util/index.js";
import { Stream } from "./Stream.js";

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
export interface State<T> {
	to(): State<T>;
	derive<TT>(transformer: Transformer<T, TT>): State<TT>;
	deriveAsync<TT>(transformer: Transformer<T, PromiseLike<TT>>): State<TT>;
}
export class State<T> extends Stream<T> {
	// Override species so `to()`, `derive()` and `deriveAsync()` with no target return new `State` instances.
	static override [Symbol.species] = State;

	/** Cached reason this state errored. */
	readonly reason: Error | unknown | typeof NOERROR = NOERROR;

	/** Time this state was last updated with a new value. */
	readonly updated: number | null = null;

	/** Age of the current value (in milliseconds). */
	get age(): number {
		return typeof this.updated === "number" ? Date.now() - this.updated : Infinity;
	}

	/** Most recently dispatched value (or throw `Promise` that resolves to the next value). */
	get value(): T {
		if (this.reason !== NOERROR) throw this.reason;
		if (this._value === LOADING) throw awaitNext(this);
		return this._value;
	}
	protected _value: T | typeof LOADING = LOADING;

	/** Is there a current value, or is it still loading. */
	get loading(): boolean {
		return this._value === LOADING;
	}

	/** Apply a transformer to this state. */
	apply(transformer: Transformer<T, T>): void {
		this.next(transform(this.value, transformer));
	}

	// Override to save the reason at `this.reason` and clean up.
	override error(reason: Error | unknown): void {
		if (!this.closed) (this as Mutable<this>).reason = reason;
		super.error(reason);
	}

	// Override to send the current error or value to any new subscribers.
	override _on(observer: Observer<T>): void {
		super._on(observer);
		if (this.reason !== NOERROR) dispatchError(observer, this.reason);
		else if (this.closed) dispatchComplete(observer);
		else if (this._value !== LOADING) dispatchNext(observer, this._value);
	}

	// Dispatcher saves any values that are dispatched.
	protected override _dispatch(value: T) {
		(this as Mutable<this>).updated = Date.now();
		if (value !== this._value) {
			this._value = value;
			super._dispatch(value);
		}
	}
}

/** Create a state with an initial value. */
export function initialState<T>(initial: T): State<T>;
export function initialState<T extends AnyState>(initial: ObserverType<T>, state: T): T;
export function initialState<T>(initial: T, state: State<T> = new State()): State<T> {
	state.next(initial);
	return state;
}

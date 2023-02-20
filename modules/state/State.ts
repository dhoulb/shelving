import type { Validatable } from "../util/validate.js";
import { Dispatch, Handler, Stop } from "../util/function.js";
import { runSequence } from "../util/sequence.js";
import { DeferredSequence } from "../sequence/DeferredSequence.js";

/** Any `State` instance. */
export type AnyState = State<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Stream that retains its most recent value
 * - Current value can be read at `state.value` and `state.data`
 * - States also send their most-recent value to any new subscribers immediately when a new subscriber is added.
 * - States can also be in a loading state where they do not have a current value.
 *
 * @param initial The initial value for the state, a `Promise` that resolves to the initial value, a source `Subscribable` to subscribe to, or another `State` instance to take the initial value from and subscribe to.
 * - To set the state to be loading, use the `State.NOVALUE` constant or a `Promise` value.
 * - To set the state to an explicit value, use that value or another `State` instance with a value.
 * */
export class State<T> implements AsyncIterable<T>, Validatable<T> {
	/** The `NOVALUE` symbol indicates no value has been received by a `State` instance. */
	static readonly NOVALUE: unique symbol = Symbol("shelving/State.NOVALUE");

	/** Deferred sequence this state uses to issue values as they change. */
	public readonly next: DeferredSequence<T>;

	/** Most recently dispatched value (or throw `Promise` that resolves to the next value). */
	get value(): T {
		if (this._value === State.NOVALUE) throw this.next;
		return this._value;
	}
	private _value: T | typeof State.NOVALUE = State.NOVALUE;

	/** Time this state was last updated with a new value. */
	get time(): number | null {
		return this._time;
	}
	protected _time: number | null = null;

	/** How old this state's value is (in milliseconds). */
	get age(): number {
		const time = this.time;
		return time !== null ? Date.now() - time : Infinity;
	}

	/** State is initiated with an initial state. */
	constructor(initial: T | typeof State.NOVALUE = State.NOVALUE, next: DeferredSequence<T> = new DeferredSequence<T>()) {
		if (initial !== State.NOVALUE) {
			this._value = this.validate(initial);
			this._time = Date.now();
		}
		this.next = next;
	}

	/** Is there a current value, or is it still loading. */
	get loading(): boolean {
		return this._value === State.NOVALUE;
	}

	/** Set the value of the state. */
	set(next: T): void {
		const value = this.validate(next);
		if (value !== this._value) {
			this._value = value;
			this._time = Date.now();
			this.next.resolve(value);
		}
	}

	/** Set the value of the state as values are pulled from a sequence. */
	async *through(sequence: AsyncIterable<T>): AsyncIterable<T> {
		for await (const value of sequence) {
			this.set(value);
			yield value;
		}
	}

	/** Pull values from a source sequence until the returned stop function is called. */
	from(source: AsyncIterable<T>, onError?: Handler): Stop {
		return runSequence(this.through(source), onError);
	}

	/** Push values to another state or callback to this state until the returned stop function is called. */
	to(target: Dispatch<[T]>, onError?: Handler): Stop {
		return runSequence(this, target, onError);
	}

	// Implement `AsyncIterable`
	// Issues the current value of the state first, then any subsequent values that are issued.
	async *[Symbol.asyncIterator](): AsyncIterator<T> {
		await Promise.resolve(); // Introduce a slight delay, i.e. don't immediately yield `this.value` in case it is changed synchronously.
		if (!this.loading) yield this.value;
		yield* this.next;
	}

	/** Validate data set on this state. */
	validate(value: T): T {
		return value;
	}
}

/** Is an unknown value a `State` instance. */
export const isState = <T extends AnyState>(v: T | unknown): v is T => v instanceof State;

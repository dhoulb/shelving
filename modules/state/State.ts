import { DeferredSequence } from "../sequence/DeferredSequence.js";
import { NONE } from "../util/constants.js";

/** Any `State` instance. */
export type AnyState = State<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Stream that retains its most recent value
 * - Current value can be read at `state.value` and `state.data`
 * - States also send their most-recent value to any new subscribers immediately when a new subscriber is added.
 * - States can also be in a loading state where they do not have a current value.
 *
 * @param initial The initial value for the state, a `Promise` that resolves to the initial value, a source `Subscribable` to subscribe to, or another `State` instance to take the initial value from and subscribe to.
 * - To set the state to be loading, use the `NONE` constant or a `Promise` value.
 * - To set the state to an explicit value, use that value or another `State` instance with a value.
 * */
export class State<T> implements AsyncIterable<T> {
	/** Deferred sequence this state uses to issue values as they change. */
	public readonly next: DeferredSequence<T> = new DeferredSequence();

	/** Current value of the state (or throw a promise that resolves when this state receives its next value or error). */
	get value(): T {
		if (this._reason !== undefined) throw this._reason;
		if (this._value === NONE) throw this.next;
		return this._value;
	}
	set value(value: T) {
		this._reason = undefined;
		this._time = Date.now();
		if (value !== this._value) {
			this._value = value;
			this.next.resolve(value);
		}
	}
	private _value: T | typeof NONE = NONE;

	/** Is there a current value, or is it still loading. */
	get loading(): boolean {
		return this._value === NONE;
	}

	/** Time (in milliseconds) this state was last updated with a new value, or `undefined` if this state is currently loading. */
	get time(): number | undefined {
		return this._value === NONE ? undefined : this._time;
	}
	private _time: number | undefined;

	/** How old this state's value is (in milliseconds). */
	get age(): number {
		const time = this.time;
		return typeof time === "number" ? Date.now() - time : Infinity;
	}

	/** Current error of this state (or `undefined` if there is no reason). */
	get reason(): unknown {
		return this._reason;
	}
	set reason(reason: Error | unknown) {
		this._reason = reason;
		if (reason !== undefined) {
			this.next.reject(reason);
		}
	}
	private _reason: unknown = undefined;

	/** State is initiated with an initial state. */
	constructor(value: T | typeof NONE, time = Date.now()) {
		this._value = value;
		this._time = time;
	}

	/** Set the value of the state. */
	set(next: T): void {
		this.value = next;
	}

	/** Set the value of the state as values are pulled from a sequence. */
	async *through(sequence: AsyncIterable<T>): AsyncIterable<T> {
		for await (const value of sequence) {
			this.value = value;
			yield value;
		}
	}

	// Implement `AsyncIterable`
	// Issues the current value of the state first, then any subsequent values that are issued.
	async *[Symbol.asyncIterator](): AsyncGenerator<T, void, void> {
		await Promise.resolve(); // Introduce a slight delay, i.e. don't immediately yield `this.value` in case it is changed synchronously.
		if (!this.loading) yield this.value;
		yield* this.next;
	}
}

/** Is an unknown value a `State` instance. */
export const isState = <T extends AnyState>(value: T | unknown): value is T => value instanceof State;

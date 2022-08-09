import type { Mutable } from "../util/data.js";
import { Matchable } from "../util/match.js";
import { ConditionError } from "../error/ConditionError.js";
import { Subject } from "../observe/Subject.js";
import { awaitNext } from "../observe/util.js";
import { dispatchComplete, dispatchError, dispatchNext, Observer } from "../observe/Observer.js";

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
export class State<T> extends Subject<T> implements Matchable<T, void> {
	/** The `NOVALUE` symbol indicates no value has been received by a `State` instance. */
	static readonly NOVALUE: unique symbol = Symbol("shelving/State.NOVALUE");

	/** The `NOERROR` symbol indicates no error has been received by a `State` instance. */
	static readonly NOERROR: unique symbol = Symbol("shelving/State.NOERROR");

	/** Cached reason this state errored. */
	readonly reason: Error | unknown | typeof State.NOERROR = State.NOERROR;

	/** Most recently dispatched value (or throw `Promise` that resolves to the next value). */
	get value(): T {
		if (this.reason !== State.NOERROR) throw this.reason;
		if (this._value === State.NOVALUE) throw awaitNext(this);
		return this._value;
	}
	private _value: T | typeof State.NOVALUE;

	/** Time this state was last updated with a new value. */
	get time(): number | null {
		return this._time;
	}
	protected _time: number | null;

	/** How old this state's value is (in milliseconds). */
	get age(): number {
		const time = this.time;
		return time !== null ? Date.now() - time : Infinity;
	}

	/** State is initiated with an initial state. */
	constructor(initial: T | typeof State.NOVALUE);
	constructor();
	constructor(...args: [] | [T]);
	constructor(...args: [] | [T]) {
		super();
		this._value = args.length ? args[0] : State.NOVALUE;
		this._time = args.length ? Date.now() : null;
	}

	/** Is there a current value, or is it still loading. */
	get loading(): boolean {
		return this._value === State.NOVALUE;
	}

	// Override to only dispatch if the value changes.
	override next(value: T): void {
		if (this.closed) throw new ConditionError("Stream is closed");
		if (!this.match(value)) this._dispatch(value);
	}

	// Override to save the reason at `this.reason` and clean up.
	override error(reason: Error | unknown): void {
		if (!this.closed) (this as Mutable<this>).reason = reason;
		super.error(reason);
	}

	// Override to send the current error or value to any new subscribers.
	protected override _addObserver(observer: Observer<T>): void {
		super._addObserver(observer);
		if (this.reason !== State.NOERROR) dispatchError(observer, this.reason);
		else if (this.closed) dispatchComplete(observer);
		else if (this._value !== State.NOVALUE) dispatchNext(observer, this._value);
	}

	// Override to save value that is dispatched.
	protected override _dispatch(value: T) {
		this._value = value;
		this._time = Date.now();
		super._dispatch(value);
	}

	// Implement Matchable to see if a value matches the current value of this state.
	// This is used to test if a new value sent to `next()` should be dispatched to any subscribers.
	match(left: T): boolean {
		return left === this._value;
	}
}

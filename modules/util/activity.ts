import { Handler, Arguments, BLACKHOLE, Dispatch, Start, Stop } from "./function.js";
import { runSequence } from "./sequence.js";

/** Something that can be started and stopped. */
export interface Activity<A extends Arguments = []> {
	/** Start this activity. */
	start(...args: A): void;
	/** Stop this activity. */
	stop(): void;
}

/** Wrap a `Start` to create an `Activity` */
export class StartActivity<A extends Arguments = []> implements Activity<A> {
	private readonly _start: Start<A>;
	private _stop: Stop | undefined;
	constructor(start: Start<A>) {
		this._start = start;
	}
	start(...args: A) {
		this._stop ||= this._start(...args) || BLACKHOLE;
	}
	stop() {
		if (this._stop) this._stop = void this._stop();
	}
}

/** Wrap an `AsyncIterable` to create an `Activity` */
export class SequenceActivity<T> implements Activity<[Dispatch<[T]>, Handler]> {
	private readonly _sequence: AsyncIterable<T>;
	private _stop: Stop | undefined;
	constructor(sequence: AsyncIterable<T>) {
		this._sequence = sequence;
	}
	start(onNext?: Dispatch<[T]>, onError?: Handler) {
		this._stop ||= runSequence(this._sequence, onNext, onError);
	}
	stop() {
		if (this._stop) this._stop = void this._stop();
	}
}

/** Set of items that starts/stops an `Activity` when it has items. */
export class LazySet<T> extends Set<T> {
	private readonly _activity: Activity<[Set<T>]>;
	constructor(start: Start<[Set<T>]>) {
		super();
		this._activity = new StartActivity(start);
	}
	override add(value: T): this {
		super.add(value);
		this._activity.start(this);
		return this;
	}
	override delete(value: T): boolean {
		const deleted = super.delete(value);
		if (!this.size) this._activity.stop();
		return deleted;
	}
}

/** Map of items that starts/stops an `Activity` when it has items. */
export class LazyMap<K, T> extends Map<K, T> {
	private readonly _activity: Activity<[Map<K, T>]>;
	constructor(start: Start<[Map<K, T>]>) {
		super();
		this._activity = new StartActivity(start);
	}
	override set(key: K, value: T): this {
		super.set(key, value);
		this._activity.start(this);
		return this;
	}
	override delete(key: K): boolean {
		const deleted = super.delete(key);
		if (!this.size) this._activity.stop();
		return deleted;
	}
}

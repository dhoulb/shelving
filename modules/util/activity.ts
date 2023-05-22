import type { Dispatch } from "./function.js";
import { BLACKHOLE } from "./function.js";

/** Function that starts something. */
export type Start<T = void> = (value: T) => Stop | void;

/** Function that stops something. */
export type Stop = Dispatch;

/** Something that can be started and stopped. */
export interface Activity<T = void> {
	/** Start this activity. */
	start(value: T): void;
	/** Stop this activity. */
	stop(): void;
}

/** Wrap a `Start` function to create an `Activity` object. */
export class StartActivity<T = void> implements Activity<T> {
	private readonly _start: Start<T>;
	private _stop: Stop | undefined;
	constructor(start: Start<T>) {
		this._start = start;
	}
	start(value: T) {
		this._stop ||= this._start(value) || BLACKHOLE;
	}
	stop() {
		if (this._stop) this._stop = void this._stop();
	}
}

/** Set of items that starts/stops an `Activity` when it has items. */
export class LazySet<T> extends Set<T> {
	private readonly _activity: Activity<Set<T>>;
	constructor(start: Start<Set<T>>) {
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
	private readonly _activity: Activity<Map<K, T>>;
	constructor(start: Start<Map<K, T>>) {
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

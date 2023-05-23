import type { StartCallback, StopCallback } from "./callback.js";

/** Interface for something that can be switched on and off. */
export interface Switchable<T> {
	/** Start this thing. */
	on(value: T): void;
	/** Stop this thing. */
	off(): void;
}

/** Wrap a `Start` function to create a `Switchable and ensure the start function is only started and stopped once. */
export class Switch<T = void> implements Switchable<T> {
	private readonly _start: StartCallback<T>;
	private _stop: StopCallback | void = undefined;
	constructor(start: StartCallback<T>) {
		this._start = start;
	}
	on(value: T) {
		this._stop ||= this._start(value);
	}
	off() {
		if (this._stop) this._stop = void this._stop();
	}
}

/** Set of items that switches on when it has items and off when it doesn't. */
export class SwitchingSet<T> extends Set<T> {
	private readonly _switch: Switchable<Set<T>>;
	constructor(start: StartCallback<Set<T>>) {
		super();
		this._switch = new Switch(start);
	}
	override add(value: T): this {
		super.add(value);
		this._switch.on(this);
		return this;
	}
	override delete(value: T): boolean {
		const deleted = super.delete(value);
		if (!this.size) this._switch.off();
		return deleted;
	}
}

/** Map of items that switches on when it has items and off when it doesn't. */
export class SwitchingMap<K, T> extends Map<K, T> {
	private readonly _switch: Switchable<Map<K, T>>;
	constructor(start: StartCallback<Map<K, T>>) {
		super();
		this._switch = new Switch(start);
	}
	override set(key: K, value: T): this {
		super.set(key, value);
		this._switch.on(this);
		return this;
	}
	override delete(key: K): boolean {
		const deleted = super.delete(key);
		if (!this.size) this._switch.off();
		return deleted;
	}
}

import type { StartCallback, StopCallback } from "./callback.js";
import { isFunction } from "./function.js";

/** Something that can be started or stopped. */
export interface Switch<T> {
	/** Start the thing. */
	start(value: T): void;
	/** Stop the thing. */
	stop(value: T): void;
}

/** Something that can become an `Switch` */
export type PossibleSwitch<T> = StartCallback<T> | Switch<T>;

/**
 * Wrap a `StartCallback` and create a `Switch`
 * - Ensures that the start and stop callbacks are only called once.
 */
export class StartSwitch<T> implements Switch<T> {
	private readonly _start: StartCallback<T>;
	private _stop: StopCallback | undefined = undefined;
	constructor(start: StartCallback<T>) {
		this._start = start;
	}
	start(v: T) {
		this._stop ||= this._start(v);
	}
	stop() {
		if (this._stop) this._stop = void this._stop();
	}
}

/** Turn a possible switch into a switch. */
export const getSwitch = <T>(v: PossibleSwitch<T>): Switch<T> => (isFunction(v) ? new StartSwitch<T>(v) : v);

/** Set of items that starts a switch when it has items and stops it when it has no items. */
export class SwitchingSet<T> extends Set<T> implements Switch<T> {
	private readonly _switch: Switch<Set<T>>;
	constructor(input: PossibleSwitch<Set<T>>) {
		super();
		this._switch = getSwitch(input);
	}
	override add(value: T): this {
		super.add(value);
		this._switch.start(this);
		return this;
	}
	override delete(value: T): boolean {
		const deleted = super.delete(value);
		if (!this.size) this._switch.stop(this);
		return deleted;
	}
	override clear(): void {
		this.clear();
		this._switch.stop(this);
	}
	// Implement `Switch`
	start(value: T): void {
		this.add(value);
	}
	stop(value: T): void {
		this.delete(value);
	}
}

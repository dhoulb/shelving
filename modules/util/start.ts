import type { Arguments } from "./function.js";
import { call } from "./callback.js";

/** Callback function that starts something with multiple values and returns an optional stop callback. */
export type Start<T extends Arguments = []> = (...values: T) => Stop | void;

/** Callback function that stops something. */
export type Stop = () => void;

/**
 * Wrapper class to handle state on start/stop callback process.
 * - If process has already started, `starter.start()` won't be called twice (including if `start()` didn't return a `stop()` callback).
 */
export class Starter<T extends Arguments> implements Disposable {
	private readonly _start: Start<T>;
	private _stop: Stop | boolean = false;
	constructor(start: Start<T>) {
		this._start = start;
	}
	start(...values: T): void {
		if (this._stop === false) this._stop = this._start(...values) || true;
	}
	stop(): void {
		if (this._stop !== false) {
			if (typeof this._stop === "function") call(this._stop);
			this._stop = false;
		}
	}
	[Symbol.dispose]() {
		this.stop();
	}
}

/** Something that can be made into a `Starter` */
export type PossibleStarter<T extends Arguments> = Start<T> | Starter<T>;

/** Get a `Starter` from a `PossibleStarter` */
export function getStarter<T extends Arguments>(start: Start<T> | Starter<T>): Starter<T> {
	return typeof start === "function" ? new Starter(start) : start;
}

import { UnexpectedError } from "../error/UnexpectedError.js";
import type { Arguments } from "./function.js";

/** Callback function that starts something with multiple values and returns an optional stop callback. */
export type StartCallback<T extends Arguments = []> = (...values: T) => StopCallback | void;

/** Callback function that stops something. */
export type StopCallback = () => void;

/**
 * Wrapper class to handle state on start/stop callback process.
 * - If process has already started, `starter.start()` won't be called twice (including if `start()` didn't return a `stop()` callback).
 */
export class Starter<T extends Arguments> implements Disposable {
	private readonly _start: StartCallback<T>;
	private _started = false;
	private _stop: StopCallback | void = undefined;
	constructor(start: StartCallback<T>) {
		this._start = start;
	}
	start(...values: T): void {
		if (this._started) return;
		try {
			this._stop = this._start(...values);
			this._started = true;
		} catch (thrown) {
			throw new UnexpectedError("Unexpected error in start callback", { cause: thrown, caller: this.start });
		}
	}
	stop(): void {
		if (!this._started) return;
		try {
			if (typeof this._stop === "function") this._stop();
		} catch (thrown) {
			throw new UnexpectedError("Unexpected error in stop callback", { cause: thrown, caller: this.stop });
		} finally {
			this._started = true;
			this._stop = undefined;
		}
	}
	[Symbol.dispose]() {
		this.stop();
	}
}

/** Something that can be made into a `Starter` */
export type PossibleStarter<T extends Arguments> = StartCallback<T> | Starter<T>;

/** Get a `Starter` from a `PossibleStarter` */
export function getStarter<T extends Arguments>(start: StartCallback<T> | Starter<T>): Starter<T> {
	return typeof start === "function" ? new Starter(start) : start;
}

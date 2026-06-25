import { UnexpectedError } from "../error/UnexpectedError.js";
import { type Arguments, BLACKHOLE } from "./function.js";

/**
 * Callback function that starts something with multiple values and returns an optional stop callback.
 *
 * @see https://shelving.cc/util/start/StartCallback
 */
export type StartCallback<T extends Arguments = []> = (...values: T) => StopCallback | void;

/**
 * Callback function that stops something.
 *
 * @see https://shelving.cc/util/start/StopCallback
 */
export type StopCallback = () => void;

/**
 * Callback function that does nothing and returns a blackhole stop callback.
 * - Useful as a no-op default where a `StartCallback` is expected.
 *
 * @see https://shelving.cc/util/start/STOPHOLE
 */
export const STOPHOLE: (...args: Arguments) => StopCallback = () => BLACKHOLE;

/**
 * Wrapper class to handle state on start/stop callback process.
 * - If process has already started, `starter.start()` won't be called twice (including if `start()` didn't return a `stop()` callback).
 * - Implements `Disposable` so it can be used with `using`, calling `stop()` on disposal.
 *
 * @see https://shelving.cc/util/start/Starter
 */
export class Starter<T extends Arguments = []> implements Disposable {
	private readonly _start: StartCallback<T>;
	private _started = false;
	private _stop: StopCallback | void = undefined;
	constructor(start: StartCallback<T>) {
		this._start = start;
	}
	/**
	 * Run the start callback (once).
	 * - Does nothing if the process has already been started.
	 *
	 * @param values Values forwarded to the start callback.
	 * @returns Nothing.
	 * @throws {UnexpectedError} If the start callback throws.
	 * @see https://shelving.cc/util/start/Starter/start
	 */
	start(...values: T): void {
		if (this._started) return;
		try {
			this._stop = this._start(...values);
			this._started = true;
		} catch (thrown) {
			throw new UnexpectedError("Unexpected error in start callback", { cause: thrown, caller: this.start });
		}
	}
	/**
	 * Run the stop callback (if one was returned by the start callback).
	 * - Does nothing if the process was never started.
	 *
	 * @returns Nothing.
	 * @throws {UnexpectedError} If the stop callback throws.
	 * @see https://shelving.cc/util/start/Starter/stop
	 */
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

/**
 * Something that can be made into a `Starter`.
 *
 * @see https://shelving.cc/util/start/PossibleStarter
 */
export type PossibleStarter<T extends Arguments> = StartCallback<T> | Starter<T>;

/**
 * Get a `Starter` from a `PossibleStarter`.
 * - Returns the input unchanged when it is already a `Starter`; otherwise wraps the callback in a new `Starter`.
 *
 * @param start A `StartCallback` or an existing `Starter`.
 * @see https://shelving.cc/util/start/getStarter
 */
export function getStarter<T extends Arguments>(start: StartCallback<T> | Starter<T>): Starter<T> {
	return typeof start === "function" ? new Starter(start) : start;
}

import { PartialObserver } from "../../dist/index.js";
import { Timeout } from "../util/timeout.js";
import { State } from "./State.js";

/**
 * State that tidies up after itself by completing itself after all its subscribers unsubscribe.
 * @param delay How long to wait (in ms) before the source subscription is stopped.
 */
export class SelfClosingState<T> extends State<T> {
	// Override to close this state when the last observer is removed.
	override _removeObserver(): void {
		if (!this.subscribers && !this.closed) this.complete();
	}
}

/**
 * State that tidies up after itself by completing itself after all its subscribers unsubscribe.
 * @param delay How long to wait (in ms) before the source subscription is stopped.
 */
export class DelayedSelfClosingState<T> extends State<T> {
	private _timeout: Timeout;
	constructor(delay: number, ...args: [] | [T]) {
		super(...args);
		this._timeout = new Timeout(() => {
			if (!this.closed) this.complete();
		}, delay);
	}
	// Override to clear the timeout when an observer is added.
	override _addObserver(observer: PartialObserver<T>): void {
		super._addObserver(observer);
		this._timeout.clear();
	}
	// Override to close this state when the last observer is removed.
	override _removeObserver(observer: PartialObserver<T>): void {
		super._removeObserver(observer);
		if (!this.subscribers) this._timeout.set();
	}
}

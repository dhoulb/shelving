import type { StartCallback } from "../util/callback.js";
import type { Switch } from "../util/switch.js";
import { SwitchingSet } from "../util/switch.js";
import { DeferredSequence } from "./DeferredSequence.js";
import { SwitchingSequence } from "./SwitchingSequence.js";

/** Deferred sequence of values that switches on when it has iterators that are iterating, and off when all iterators are done. */
export class SwitchingDeferredSequence<T = void, R = void> extends DeferredSequence<T, R> {
	private readonly _switch: Switch<AsyncIterator<T, R>>;
	constructor(start: StartCallback<DeferredSequence<T, R>>) {
		super();
		this._switch = new SwitchingSet<AsyncIterator<T, R>>(() => start(this));
	}
	override [Symbol.asyncIterator](): AsyncGenerator<T, R, void> {
		return new SwitchingSequence(this, this._switch);
	}
}

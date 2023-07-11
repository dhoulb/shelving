import type { PossibleSwitch, Switch } from "../util/switch.js";
import { getSwitch } from "../util/switch.js";
import { ThroughSequence } from "./ThroughSequence.js";

/** Async generator that switches on when it has iterators that are iterating, and off when all iterators are done. */
export class SwitchingSequence<T, R, N> extends ThroughSequence<T, R, N> implements ThroughSequence<T, R, N> {
	private readonly _switch: Switch<AsyncIterator<T, R, N>>;
	constructor(source: AsyncIterator<T, R, N>, switchable: PossibleSwitch<AsyncIterator<T, R, N>>) {
		super(source);
		this._switch = getSwitch(switchable);
	}
	override async next(next: N): Promise<IteratorResult<T, R>> {
		this._switch.start(this); // Register this in anticipation that it'll continue iterating.
		try {
			const result = await super.next(next);
			if (result.done) this._switch.stop(this); // Deregister this.
			else this._switch.start(this); // Register this.
			return result;
		} catch (caught) {
			this._switch.stop(this);
			throw caught;
		}
	}
	override async return(value: R | PromiseLike<R>): Promise<IteratorResult<T, R>> {
		try {
			const result = await super.return(value);
			if (result.done) this._switch.stop(this); // Deregister this.
			else this._switch.start(this); // Stop this.
			return result;
		} catch (caught) {
			this._switch.stop(this);
			throw caught;
		}
	}
	override async throw(reason: Error | unknown): Promise<IteratorResult<T, R>> {
		try {
			const result = await super.throw(reason);
			if (result.done) this._switch.stop(this); // Deregister this.
			else this._switch.start(this); // Start this.
			return result;
		} catch (caught) {
			this._switch.stop(this);
			throw caught;
		}
	}
}

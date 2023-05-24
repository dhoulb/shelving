import type { PossibleSwitch, Switch } from "../util/switch.js";
import { getSwitch } from "../util/switch.js";
import { ThroughSequence } from "./ThroughSequence.js";

/** Async generator that switches on when it has iterators that are iterating, and off when all iterators are done. */
export class SwitchingSequence<T, R> extends ThroughSequence<T, R> implements ThroughSequence<T, R> {
	private readonly _switch: Switch<AsyncIterator<T, R>>;
	constructor(source: AsyncIterator<T, R>, switchable: PossibleSwitch<AsyncIterator<T, R>>) {
		super(source);
		this._switch = getSwitch(switchable);
	}
	override async next(): Promise<IteratorResult<T, R>> {
		this._switch.start(this); // Register this in anticipation that it'll continue iterating.
		try {
			const result = await super.next();
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

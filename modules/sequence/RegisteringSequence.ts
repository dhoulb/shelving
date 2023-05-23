import { ThroughSequence } from "./ThroughSequence.js";

/** Async generator that registers itself with a `Set` when it's iterating, and deregisters itself again when it stops. */
export class RegisteringSequence<T, R> extends ThroughSequence<T, R> implements ThroughSequence<T, R> {
	private _set: Set<AsyncIterator<T, R>>;
	constructor(source: AsyncIterator<T, R>, set: Set<AsyncIterator<T, R>>) {
		super(source);
		this._set = set;
	}
	override async next(): Promise<IteratorResult<T, R>> {
		this._set.add(this); // Register this in anticipation that it'll continue iterating.
		try {
			const result = await super.next();
			if (result.done) this._set.delete(this); // Deregister this.
			else this._set.add(this); // Register this.
			return result;
		} catch (caught) {
			this._set.delete(this);
			throw caught;
		}
	}
	override async return(value: R | PromiseLike<R>): Promise<IteratorResult<T, R>> {
		try {
			const result = await super.return(value);
			if (result.done) this._set.delete(this); // Deregister this.
			else this._set.add(this); // Register this.
			return result;
		} catch (caught) {
			this._set.delete(this);
			throw caught;
		}
	}
	override async throw(reason: Error | unknown): Promise<IteratorResult<T, R>> {
		try {
			const result = await super.throw(reason);
			if (result.done) this._set.delete(this); // Deregister this.
			else this._set.add(this); // Register this.
			return result;
		} catch (caught) {
			this._set.delete(this);
			throw caught;
		}
	}
}

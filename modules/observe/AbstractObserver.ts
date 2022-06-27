import { dispatch } from "../util/function.js";
import { ConditionError } from "../error/ConditionError.js";
import { Subscribable, subscribe, Unsubscribe } from "./Observable.js";
import { PartialObserver, dispatchError, dispatchComplete, ConnectableObserver } from "./Observer.js";

/** Abstract observer designed to pass values through to an observer. */
export abstract class AbstractObserver<I, O> implements ConnectableObserver<I> {
	private _target: PartialObserver<O> | undefined;
	private _cleanup: Unsubscribe | undefined;
	get closed(): boolean {
		return !this._target;
	}
	get target(): PartialObserver<O> {
		if (!this._target) throw new ConditionError("Observer is closed");
		return this._target;
	}
	constructor(target: PartialObserver<O>) {
		this._target = target;
	}
	connect(subscribable: Subscribable<I>): Unsubscribe {
		if (!this._target) throw new ConditionError("Observer is closed");
		if (this._cleanup) throw new ConditionError("Observer is already connected");
		this._cleanup = subscribe(subscribable, this);
		return () => {
			if (this._cleanup) this._cleanup = void dispatch(this._cleanup);
		};
	}
	abstract next(value: I): void;
	error(reason: Error | unknown): void {
		const target = this.target;
		this._target = undefined; // Close this observer.
		dispatchError(target, reason);
	}
	complete(): void {
		const target = this.target;
		this._target = undefined; // Close this observer.
		dispatchComplete(target);
	}
}

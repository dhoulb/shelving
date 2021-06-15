import { Mutable } from "../object";

export class ResolvablePromise<T> extends Promise<T> {
	readonly resolve!: (value: T) => void;
	readonly reject!: (error: Error | unknown) => void;
	constructor(initiator?: (resolve: (value: T) => void, reject: (error: Error | unknown) => void) => void) {
		super((resolve, reject) => {
			(this as Mutable<this>).resolve = resolve;
			(this as Mutable<this>).reject = reject;
			if (initiator) initiator(resolve, reject);
		});
	}
}

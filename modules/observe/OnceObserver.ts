import { ThroughObserver } from "./ThroughObserver.js";

/** Observer that fires once then ends itself. */
export class OnceObserver<T> extends ThroughObserver<T> {
	override next(value: T) {
		super.next(value);
		this.complete();
	}
}

import { match, Matcher } from "../util/match.js";
import { MatchableObserver } from "./MatchableObserver.js";
import { PartialObserver } from "./Observer.js";

/** Observer that filters is next value with a matcher. */
export class MatchObserver<T> extends MatchableObserver<T> {
	protected _matcher: Matcher<T, void>;
	constructor(matcher: Matcher<T, void>, target: PartialObserver<T>) {
		super(target);
		this._matcher = matcher;
	}
	match(value: T): boolean {
		return match(value, this._matcher);
	}
}

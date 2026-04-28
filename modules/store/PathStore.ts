import type { AnyCaller } from "../util/function.js";
import type { AbsolutePath, PossiblePath } from "../util/path.js";
import { isPathActive, isPathProud, requirePath } from "../util/path.js";
import { Store } from "./Store.js";

/** Store an absolute path, e.g. `/a/b/c` */
export class PathStore extends Store<PossiblePath, AbsolutePath> {
	readonly base: AbsolutePath;

	// Override to set default path to `.` and base to `/`
	constructor(path = ".", base: AbsolutePath = "/") {
		super(requirePath(path, base, PathStore));
		this.base = base;
	}

	// Implement to convert a possible path to an absolute path (relative to `this.base`).
	override convert(possible: PossiblePath, caller: AnyCaller): AbsolutePath {
		return requirePath(possible, this.base, caller);
	}

	/** Based on the current store path, is a path active? */
	isActive(path: AbsolutePath): boolean {
		return isPathActive(this.value, path);
	}

	/** Based on the current store path, is a path proud (i.e. a child of the current store path)? */
	isProud(path: AbsolutePath): boolean {
		return isPathProud(this.value, path);
	}

	/** Get an absolute path from a path relative to the current store path. */
	getPath(path: string): AbsolutePath {
		return requirePath(path, this.value);
	}

	override toString(): string {
		return this.value;
	}
}

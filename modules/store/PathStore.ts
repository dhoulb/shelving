import type { AnyCaller } from "../util/function.js";
import type { AbsolutePath, PossiblePath } from "../util/path.js";
import { isPathActive, isPathProud, requirePath } from "../util/path.js";
import { BusyStore } from "./BusyStore.js";

/**
 * Store an absolute path, e.g. `/a/b/c`
 *
 * @param path: The initial value for the store.
 * @param base: The base path to resolve relative paths against.
 */
export class PathStore extends BusyStore<AbsolutePath, PossiblePath> {
	readonly base: AbsolutePath;

	// Override to set default path to `.` and base to `/`
	constructor(path = ".", base: AbsolutePath = "/") {
		super(requirePath(path, base, PathStore));
		this.base = base;
	}

	// Override to convert a possible path to an absolute path (relative to `this.base`).
	protected override _convert(possible: PossiblePath, caller: AnyCaller): AbsolutePath {
		return requirePath(possible, this.base, caller);
	}

	// Override for fast equality.
	protected override _equal(a: AbsolutePath, b: AbsolutePath) {
		return a === b;
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

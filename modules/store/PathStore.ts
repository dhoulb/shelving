import type { AnyCaller } from "../util/function.js";
import type { AbsolutePath, RelativePath } from "../util/path.js";
import { isPathActive, isPathProud, requireAbsolutePath } from "../util/path.js";
import { BusyStore } from "./BusyStore.js";

/**
 * Store an absolute path, e.g. `/a/b/c`
 *
 * @param path: The initial value for the store.
 * @param base: The base path to resolve relative paths against.
 */
export class PathStore extends BusyStore<AbsolutePath, AbsolutePath | RelativePath> {
	readonly base: AbsolutePath;

	// Override to set default path to `.` and base to `/`
	constructor(path: AbsolutePath | RelativePath = ".", base: AbsolutePath = "/") {
		super(requireAbsolutePath(path, base, PathStore));
		this.base = base;
	}

	// Override to convert a possible path to an absolute path (relative to `this.base`).
	protected override _convert(possible: AbsolutePath | RelativePath, caller: AnyCaller): AbsolutePath {
		return requireAbsolutePath(possible, this.base, caller);
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
	getPath(path: AbsolutePath | RelativePath): AbsolutePath {
		return requireAbsolutePath(path, this.value);
	}

	override toString(): string {
		return this.value;
	}
}

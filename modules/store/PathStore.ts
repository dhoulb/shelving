import type { AnyCaller } from "../util/function.js";
import type { AbsolutePath, RelativePath } from "../util/path.js";
import { isPathActive, isPathProud, requirePath } from "../util/path.js";
import { BusyStore } from "./BusyStore.js";

/**
 * Store an absolute path, e.g. `/a/b/c`
 * - Accepts absolute or relative paths as input and normalises them to an absolute path against `this.base`.
 * - Provides helpers to test whether other paths are active or proud relative to the current path.
 *
 * @see https://shelving.cc/store/PathStore
 */
export class PathStore extends BusyStore<AbsolutePath, AbsolutePath | RelativePath> {
	/**
	 * Base path that relative inputs are resolved against.
	 *
	 * @see https://shelving.cc/store/PathStore/base
	 */
	readonly base: AbsolutePath;

	// Override to set default path to `.` and base to `/`
	constructor(path: AbsolutePath | RelativePath = ".", base: AbsolutePath = "/") {
		super(requirePath(path, base, PathStore));
		this.base = base;
	}

	// Override to convert a possible path to an absolute path (relative to `this.base`).
	protected override _convert(possible: AbsolutePath | RelativePath, caller: AnyCaller): AbsolutePath {
		return requirePath(possible, this.base, caller);
	}

	// Override for fast equality.
	protected override _equal(a: AbsolutePath, b: AbsolutePath) {
		return a === b;
	}

	/**
	 * Based on the current store path, is a path active (i.e. equal to the current path)?
	 *
	 * @param path The absolute path to test.
	 * @example store.isActive("/a/b");
	 * @see https://shelving.cc/store/PathStore/isActive
	 */
	isActive(path: AbsolutePath): boolean {
		return isPathActive(this.value, path);
	}

	/**
	 * Based on the current store path, is a path proud (i.e. an ancestor of the current store path)?
	 *
	 * @param path The absolute path to test.
	 * @example store.isProud("/a"); // true when current path is "/a/b"
	 * @see https://shelving.cc/store/PathStore/isProud
	 */
	isProud(path: AbsolutePath): boolean {
		return isPathProud(this.value, path);
	}

	/**
	 * Get an absolute path from a path relative to the current store path.
	 *
	 * @param path The absolute or relative path to resolve.
	 * @example store.getPath("c"); // "/a/b/c" when current path is "/a/b"
	 * @see https://shelving.cc/store/PathStore/getPath
	 */
	getPath(path: AbsolutePath | RelativePath): AbsolutePath {
		return requirePath(path, this.value);
	}

	override toString(): string {
		return this.value;
	}
}

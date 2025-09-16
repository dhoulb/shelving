import type { AbsolutePath } from "../util/path.js";
import { isPathActive, isPathProud, requirePath } from "../util/path.js";
import { Store } from "./Store.js";

/** Store an absolute path, e.g. `/a/b/c` */
export class PathStore extends Store<AbsolutePath> {
	constructor(path = ".", time?: number) {
		super(requirePath(path), time);
	}

	// Override to clean the path on set.
	override get value(): AbsolutePath {
		return super.value;
	}
	override set value(path: string) {
		super.value = requirePath(path, super.value);
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
}

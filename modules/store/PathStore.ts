import type { AbsolutePath } from "../util/path.js";
import type { PossibleStarter } from "../util/start.js";
import { getPath, isPathActive, isPathProud } from "../util/path.js";
import { Store } from "./Store.js";

/** Store an absolute path, e.g. `/a/b/c` */
export class PathStore extends Store<AbsolutePath> {
	constructor(path: AbsolutePath = window.location.pathname as AbsolutePath, time?: number, start?: PossibleStarter<[Store<AbsolutePath>]>) {
		super(path, time, start);
	}

	/** Based on the current store path, is a path active? */
	isActive(path: AbsolutePath): boolean {
		return isPathActive(path, this.value);
	}

	/** Based on the current store path, is a path proud (i.e. a child of the current store path)? */
	isProud(path: AbsolutePath): boolean {
		return isPathProud(path, this.value);
	}

	/** Get an absolute path from a path relative to the current navigation path. */
	getAbsolute(path: string): AbsolutePath {
		return getPath(path, this.value);
	}

	// Override to clean the path.
	override set(path: string): void {
		super.set(getPath(path, this.value));
	}
}

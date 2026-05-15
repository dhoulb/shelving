import { createContext, use } from "react";
import { type AbsolutePath, joinAbsolutePath } from "../../util/path.js";

/**
 * Context that holds the path-chain (sequence of element `key`s) to the currently-rendering tree element.
 * - Pushed by `<TreeRenderer>` as it descends into each element.
 * - Consumed by components inside a mapped element (e.g. menu items, cards) that need to know "where am I in the tree" — for `<a href>`, active/proud state, breadcrumbs, etc.
 * - Independent of `Meta.url` — `Meta.url` represents the user's current page URL; this context represents the URL of the currently-rendering tree element. Active state is computed by comparing the two.
 */
export const TreePathContext = createContext<readonly string[]>([]);
TreePathContext.displayName = "TreePathContext";

/** Get the path-chain (sequence of `key`s) of the currently-rendering tree element. */
export function requireTreePath(): readonly string[] {
	return use(TreePathContext);
}

/** Get the absolute URL path of the currently-rendering tree element (joined slug chain). */
export function requireTreeHref(): AbsolutePath {
	return joinAbsolutePath(use(TreePathContext));
}

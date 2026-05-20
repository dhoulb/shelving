import type { ReactElement } from "react";
import { MetaContext } from "../modules/ui/misc/MetaContext.js";
import { Navigation } from "../modules/ui/router/Navigation.js";
import { TreeApp } from "../modules/ui/tree/TreeApp.js";
import { mergeMeta, type PossibleMeta } from "../modules/ui/util/meta.js";
import type { TreeElement } from "../modules/util/element.js";
import { requireURL } from "../modules/util/index.js";

/**
 * Raw, JSON-serialisable page meta.
 * - `root` is a plain string (not an `ImmutableURL`) so the whole object survives being embedded in the
 *   HTML and read back with `JSON.parse` during hydration.
 */
export type AppMeta = Omit<PossibleMeta, "root"> & { readonly root: string };

export interface AppProps {
	/** The documentation tree to render. */
	tree: TreeElement;
	/** Raw meta describing the current page. */
	meta: AppMeta;
}

/**
 * The hydratable documentation app.
 *
 * Rendered identically on the server (by `render.tsx`) and in the browser (by `client.tsx`): given the
 * same `tree` and `meta`, both produce the same DOM, which is what lets `hydrateRoot()` adopt it.
 */
export function App({ tree, meta }: AppProps): ReactElement {
	return (
		<MetaContext value={mergeMeta({}, { ...meta, root: requireURL(meta.root) })}>
			<Navigation>
				<TreeApp tree={tree} />
			</Navigation>
		</MetaContext>
	);
}

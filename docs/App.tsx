import type { ReactElement } from "react";
import { DocumentationHomePage } from "../modules/ui/docs/DocumentationHomePage.js";
import { MetaContext } from "../modules/ui/misc/MetaContext.js";
import { Navigation } from "../modules/ui/router/Navigation.js";
import { TreeApp } from "../modules/ui/tree/TreeApp.js";
import { TreeRouterMapping } from "../modules/ui/tree/TreeRouter.js";
import { createMeta, type PossibleMeta } from "../modules/ui/util/meta.js";
import type { TreeElement } from "../modules/util/tree.js";

export interface AppProps {
	/** The documentation tree to render. */
	tree: TreeElement;
	/** Meta describing the current page — `root`/`url` may be plain strings (e.g. straight from `JSON.parse`). */
	meta: PossibleMeta;
}

/**
 * The hydratable documentation app.
 *
 * Rendered identically on the server (by `render.tsx`) and in the browser (by `client.tsx`): given the
 * same `tree` and `meta`, both produce the same DOM, which is what lets `hydrateRoot()` adopt it.
 *
 * `createMeta()` resolves `meta` from an empty base — never the ambient `MetaContext` — so the result is
 * identical on the server (where `App` sits inside `HTML`'s context) and during client hydration.
 */
export function App({ tree, meta }: AppProps): ReactElement {
	return (
		<MetaContext value={createMeta(meta)}>
			<Navigation>
				{/* Render the root (`/`) with the custom home page; deeper paths keep their default renderers. */}
				<TreeRouterMapping mapping={{ "tree-element": DocumentationHomePage }}>
					<TreeApp tree={tree} />
				</TreeRouterMapping>
			</Navigation>
		</MetaContext>
	);
}

import type { ReactElement } from "react";
import { DocumentationPage } from "../modules/ui/docs/DocumentationPage.js";
import { MetaContext } from "../modules/ui/misc/MetaContext.js";
import { Navigation } from "../modules/ui/router/Navigation.js";
import { TreeApp } from "../modules/ui/tree/TreeApp.js";
import { TreePageMapping } from "../modules/ui/tree/TreePage.js";
import { createMeta, type PossibleMeta } from "../modules/ui/util/meta.js";
import type { TreeElement } from "../modules/util/element.js";

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
	// `tree-file` pages render via `DocumentationPage` (a file's props are a compatible subset of a symbol's),
	// so file pages get the same kind-grouped card sections as symbol pages.
	return (
		<MetaContext value={createMeta(meta)}>
			<Navigation>
				<TreePageMapping mapping={{ "tree-file": DocumentationPage }}>
					<TreeApp tree={tree} />
				</TreePageMapping>
			</Navigation>
		</MetaContext>
	);
}

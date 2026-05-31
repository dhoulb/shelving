import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { Fragment, type ReactElement } from "react";
import { type AbsolutePath, joinPath, splitPath } from "../../util/path.js";
import { Button } from "../form/Button.js";
import { Flex } from "../style/Flex.js";
import { useTreeMap } from "../tree/TreeContext.js";

/** Props for `DocumentationBreadcrumbs`. */
export interface DocumentationBreadcrumbsProps {
	/** Site-root-relative path of the current page — its ancestors become the breadcrumb trail. */
	readonly path: AbsolutePath;
}

/**
 * Breadcrumb trail of links to a page's ancestors, separated by `›` arrow icons.
 * - Built from the page's own `path`: each ancestor prefix is looked up in the tree map for its title, and links to its cumulative path.
 * - Prefixes with no entry (e.g. the partial half of a `"util/string"` module name) are skipped, so composite names collapse to a single crumb.
 * - The current item is deliberately omitted — the page `<Title>` already names it.
 * - Renders nothing at the tree root (no ancestors) or when there's no `<TreeProvider>` to resolve labels from.
 */
export function DocumentationBreadcrumbs({ path }: DocumentationBreadcrumbsProps): ReactElement | null {
	const map = useTreeMap();
	const segments = splitPath(path);
	// Drop the final segment — that's the current page, named by the title itself.
	const ancestors = segments.slice(0, -1);

	const crumbs: { readonly href: AbsolutePath; readonly label: string }[] = [];
	// The root itself (joined-path key `""`) is the first crumb, when present.
	const root = map.get("");
	if (root) crumbs.push({ href: "/", label: root.title });
	for (let i = 0; i < ancestors.length; i++) {
		const entry = map.get(ancestors.slice(0, i + 1).join("/"));
		if (entry) crumbs.push({ href: joinPath("/", entry.path), label: entry.title });
	}
	if (!crumbs.length) return null;

	return (
		<Flex left wrap>
			{crumbs.map(({ href, label }, i) => (
				<Fragment key={href}>
					{i > 0 && <ChevronRightIcon />}
					<Button small plain href={href}>
						{label}
					</Button>
				</Fragment>
			))}
		</Flex>
	);
}

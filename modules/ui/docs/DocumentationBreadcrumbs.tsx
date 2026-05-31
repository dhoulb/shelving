import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { Fragment, type ReactElement } from "react";
import { resolveElementPath, type TreeElement } from "../../util/element.js";
import { type AbsolutePath, joinPath, splitPath } from "../../util/path.js";
import { Button } from "../form/Button.js";
import { Flex } from "../style/Flex.js";
import { useTree } from "../tree/TreeContext.js";

/** Props for `DocumentationBreadcrumbs`. */
export interface DocumentationBreadcrumbsProps {
	/** Site-root-relative path of the current page — its ancestors become the breadcrumb trail. */
	readonly path: AbsolutePath;
}

/**
 * Breadcrumb trail of links to a page's ancestors, separated by `›` arrow icons.
 * - Built from the page's own `path`: each ancestor segment links to its cumulative path, labelled from the tree element's title/name.
 * - The current item is deliberately omitted — the page `<Title>` already names it.
 * - Renders nothing at the tree root (no ancestors) or when there's no `<TreeContext>` to resolve labels from.
 */
export function DocumentationBreadcrumbs({ path }: DocumentationBreadcrumbsProps): ReactElement | null {
	const tree = useTree();
	const segments = splitPath(path);
	// Drop the final segment — that's the current page, named by the title itself.
	const ancestors = segments.slice(0, -1);
	if (!tree || !ancestors.length) return null;

	const crumbs: { readonly href: AbsolutePath; readonly label: string }[] = [];
	// The root itself is the first crumb (home).
	crumbs.push({ href: "/", label: tree.props.title ?? tree.props.name });
	for (let i = 0; i < ancestors.length; i++) {
		const segs = ancestors.slice(0, i + 1);
		const element = resolveElementPath(tree, segs) as TreeElement | undefined;
		crumbs.push({ href: joinPath("/", segs), label: element?.props.title ?? segs[i] ?? "" });
	}

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

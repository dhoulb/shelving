import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { Fragment, type ReactElement } from "react";
import { joinPath, splitPath } from "../../util/path.js";
import { getBlockClass } from "../block/Block.js";
import { requireMetaURL } from "../misc/MetaContext.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import type { SpaceVariants } from "../style/Space.js";
import type { TypographyVariants } from "../style/Typography.js";
import { getClass } from "../util/css.js";
import { TreeButton } from "./TreeButton.js";
import { useTreeMap } from "./TreeContext.js";

/**
 * Props for the `TreeBreadcrumbs` component — typography, space, and flex variant props.
 *
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeBreadcrumbs/TreeBreadcrumbsProps
 */
export interface TreeBreadcrumbsProps extends TypographyVariants, SpaceVariants, FlexVariants {}

/**
 * Breadcrumb trail of links to a tree page's ancestors, separated by `›` arrow icons.
 *
 * - Built from the page's own `path`: each ancestor prefix is looked up in the tree map for its title, and links to its cumulative path.
 * - Prefixes with no entry (e.g. the partial half of a `"util/string"` module name) are skipped, so composite names collapse to a single crumb.
 * - The current item is deliberately omitted — the page [`<Title>`](/ui/Title) already names it.
 * - Block spacing defaults to section spacing (via [`getBlockClass()`](/ui/getBlockClass)); pass `space` to override.
 * - Renders nothing at the tree root (no ancestors) or when there's no [`<TreeProvider>`](/ui/TreeProvider) to resolve labels from.
 *
 * @returns A `<nav>` of breadcrumb links, or `null` at the tree root.
 * @kind component
 * @example <TreeBreadcrumbs />
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeBreadcrumbs/TreeBreadcrumbs
 */
export function TreeBreadcrumbs({ tint = "70", left = true, wrap = true, ...variants }: TreeBreadcrumbsProps): ReactElement | null {
	const map = useTreeMap();
	const segments = splitPath(requireMetaURL().path).slice(0, -1); // Don't include the element itself.
	// Cumulative ancestor paths (`/util`, `/util/string`, …); skip prefixes with no element (e.g. the partial `/util` half of a `"util/string"` module name).
	const ancestors = segments.map((_, i) => joinPath("/", segments.slice(0, i + 1))).filter(path => map.has(path));
	return (
		<nav
			aria-label="Breadcrumb"
			className={getClass(
				getBlockClass({ tint, ...variants }), //
				getFlexClass({ left, wrap, ...variants }),
			)}
		>
			<TreeButton small plain name="/" />
			<ChevronRightIcon />
			{ancestors.map(path => (
				<Fragment key={path}>
					<TreeButton small plain name={path} />
					<ChevronRightIcon />
				</Fragment>
			))}
		</nav>
	);
}

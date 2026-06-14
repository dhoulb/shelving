import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { Fragment, type ReactElement } from "react";
import { splitPath } from "../../util/path.js";
import { BLOCK_CLASS } from "../block/Block.js";
import { requireMetaURL } from "../misc/MetaContext.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass } from "../util/css.js";
import { TreeButton } from "./TreeButton.js";

export interface TreeBreadcrumbsProps extends TypographyVariants, SpaceVariants, FlexVariants {}

/**
 * Breadcrumb trail of links to a tree page's ancestors, separated by `›` arrow icons.
 * - Built from the page's own `path`: each ancestor prefix is looked up in the tree map for its title, and links to its cumulative path.
 * - Prefixes with no entry (e.g. the partial half of a `"util/string"` module name) are skipped, so composite names collapse to a single crumb.
 * - The current item is deliberately omitted — the page `<Title>` already names it.
 * - Block spacing defaults to section spacing (via `BLOCK_CLASS`); pass `space` to override.
 * - Renders nothing at the tree root (no ancestors) or when there's no `<TreeProvider>` to resolve labels from.
 */
export function TreeBreadcrumbs({ tint = "70", left = true, wrap = true, ...variants }: TreeBreadcrumbsProps): ReactElement | null {
	const ancestors = splitPath(requireMetaURL().path).slice(0, -1); // Don't include the element itself.
	return (
		<nav
			aria-label="Breadcrumb"
			className={getClass(
				BLOCK_CLASS, //
				getTypographyClass({ tint, ...variants }),
				getFlexClass({ left, wrap, ...variants }),
				getSpaceClass(variants),
			)}
		>
			<TreeButton small plain name="" />
			<ChevronRightIcon />
			{ancestors.map(name => (
				<Fragment key={name}>
					<TreeButton small plain name={name} />
					<ChevronRightIcon />
				</Fragment>
			))}
		</nav>
	);
}

import type { ReactNode } from "react";
import type { TreeElementProps } from "../../util/tree.js";
import { Card } from "../block/Card.js";
import { Paragraph } from "../block/Paragraph.js";
import { Subheading } from "../block/Subheading.js";

/**
 * Card renderer for a generic `tree-element` (a directory or file) — a summary card showing the heading and description.
 *
 * @param props The tree element props (`path`, `name`, `title`, `description`).
 * @returns A `<Card>` linking to the element's canonical `path`.
 * @example <TreeCard {...element.props} />
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeCard/TreeCard
 */
export function TreeCard({ path, name, title, description }: TreeElementProps): ReactNode {
	// `path` is the element's own canonical URL, stamped by `flattenTree()` — link straight to it.
	return (
		<Card href={path}>
			<Subheading>{title ?? name}</Subheading>
			{description && <Paragraph>{description}</Paragraph>}
		</Card>
	);
}

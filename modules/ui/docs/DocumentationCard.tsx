import type { ReactNode } from "react";
import type { DocumentationElementProps } from "../../util/element.js";
import { requireTreeHref } from "../tree/TreePathContext.js";
import TREE_CARDS_CSS from "../tree/TreeCards.module.css";

/** Card renderer for a `tree-documentation` element. */
export function DocumentationCard({ title, name, description, signatures }: DocumentationElementProps): ReactNode {
	const href = requireTreeHref();
	return (
		<a className={TREE_CARDS_CSS.card} href={href}>
			<h3 className={TREE_CARDS_CSS.title}>
				<code>{title ?? name}</code>
			</h3>
			{signatures?.map(sig => (
				<pre key={sig}>
					<code>{sig}</code>
				</pre>
			))}
			{description && <p className={TREE_CARDS_CSS.description}>{description}</p>}
		</a>
	);
}

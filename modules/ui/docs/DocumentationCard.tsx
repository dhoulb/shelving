import type { ReactNode } from "react";
import type { DocumentationElementProps } from "../../util/element.js";
import { TREE_CARD_CLASS, TREE_CARD_DESCRIPTION_CLASS, TREE_CARD_TITLE_CLASS } from "../index.js";
import { requireTreeHref } from "../tree/TreePathContext.js";
import { DocumentationKind } from "./DocumentationKind.js";

/** Card renderer for a `tree-documentation` element. */
export function DocumentationCard({ title, name, kind, description, signatures }: DocumentationElementProps): ReactNode {
	const href = requireTreeHref();
	return (
		<a className={TREE_CARD_CLASS} href={href}>
			<h3 className={TREE_CARD_TITLE_CLASS}>
				<code>{title ?? name}</code>
			</h3>
			{kind && <DocumentationKind kind={kind} />}
			{signatures?.map(sig => (
				<pre key={sig}>
					<code>{sig}</code>
				</pre>
			))}
			{description && <p className={TREE_CARD_DESCRIPTION_CLASS}>{description}</p>}
		</a>
	);
}

import type { ReactNode } from "react";
import type { DocumentationElementProps } from "../../util/element.js";

/** Card renderer for a `tree-documentation` element. */
export function DocumentationCard({ title, name, description, signatures }: DocumentationElementProps): ReactNode {
	return (
		<div>
			<h3>
				<code>{title ?? name}</code>
			</h3>
			{signatures?.map(sig => (
				<pre key={sig}>
					<code>{sig}</code>
				</pre>
			))}
			{description && <p>{description}</p>}
		</div>
	);
}

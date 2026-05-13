import type { ReactNode } from "react";
import type { DocumentationElementProps } from "../../util/element.js";
import { Page } from "../page/Page.js";
import { TreeCards } from "../tree/TreeCards.js";

/**
 * Page renderer for a `tree-documentation` element.
 * - Renders title, signature, description, parameters, return type, and child symbols.
 * - All props are optional; only sections with data are shown (so this works for any `kind`).
 */
export function DocumentationPage({
	title,
	name,
	description,
	signature,
	params,
	returns,
	children,
}: DocumentationElementProps): ReactNode {
	return (
		<Page title={title ?? name}>
			{signature && (
				<pre>
					<code>{signature}</code>
				</pre>
			)}
			{description && <p>{description}</p>}
			{params && (
				<section>
					<h2>Parameters</h2>
					<dl>
						{params.map(p => (
							<div key={p.name}>
								<dt>
									<code>{p.name}</code>
									{p.type && (
										<>
											: <code>{p.type}</code>
										</>
									)}
									{p.optional && <> (optional)</>}
								</dt>
								{p.description && <dd>{p.description}</dd>}
							</div>
						))}
					</dl>
				</section>
			)}
			{returns && (
				<section>
					<h2>Returns</h2>
					<p>
						<code>{returns}</code>
					</p>
				</section>
			)}
			{children && <TreeCards>{children}</TreeCards>}
		</Page>
	);
}

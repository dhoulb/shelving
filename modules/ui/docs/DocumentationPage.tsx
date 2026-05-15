import type { ReactNode } from "react";
import type { DocumentationElementProps } from "../../util/element.js";
import { Page } from "../page/Page.js";
import { TreeCards } from "../tree/TreeCards.js";

const DEFAULT_TYPE = "unknown";

/**
 * Page renderer for a `tree-documentation` element.
 * - Renders title, signatures (one per overload), description, parameters, returns, throws, examples, and child symbols.
 * - All sections are conditional — only render when their array has entries.
 */
export function DocumentationPage({
	title,
	name,
	description,
	signatures,
	params,
	returns,
	throws,
	examples,
	children,
}: DocumentationElementProps): ReactNode {
	return (
		<Page title={title ?? name}>
			{signatures?.map(sig => (
				<pre key={sig}>
					<code>{sig}</code>
				</pre>
			))}
			{description && <p>{description}</p>}
			{params?.length && (
				<section>
					<h2>Parameters</h2>
					<dl>
						{params.map(({ name, type = DEFAULT_TYPE, description = "", optional }) => (
							<div key={`${name}-${type}-${description}`}>
								<dt>
									<code>{name}</code>: <code>{type ?? DEFAULT_TYPE}</code>
									{optional && <> (optional)</>}
								</dt>
								{description && <dd>{description}</dd>}
							</div>
						))}
					</dl>
				</section>
			)}
			{returns?.length && (
				<section>
					<h2>Returns</h2>
					<dl>
						{returns.map(({ type = DEFAULT_TYPE, description = "" }) => (
							<div key={`${type}-${description}`}>
								<dt>
									<code>{type}</code>
								</dt>
								{description && <dd>{description}</dd>}
							</div>
						))}
					</dl>
				</section>
			)}
			{throws?.length && (
				<section>
					<h2>Throws</h2>
					<dl>
						{throws.map(({ type = DEFAULT_TYPE, description = "" }) => (
							<div key={`${type}-${description}`}>
								<dt>
									<code>{type}</code>
								</dt>
								{description && <dd>{description}</dd>}
							</div>
						))}
					</dl>
				</section>
			)}
			{examples?.length && (
				<section>
					<h2>Examples</h2>
					{examples.map(({ description }) => (
						<pre key={description}>
							<code>{description}</code>
						</pre>
					))}
				</section>
			)}
			{children && <TreeCards>{children}</TreeCards>}
		</Page>
	);
}

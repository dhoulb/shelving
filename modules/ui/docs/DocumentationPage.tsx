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
			{signatures?.map((sig, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: signatures have no stable identity beyond position.
				<pre key={i}>
					<code>{sig}</code>
				</pre>
			))}
			{description && <p>{description}</p>}
			{params && params.length > 0 && (
				<section>
					<h2>Parameters</h2>
					<dl>
						{params.map((p, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: params can repeat across overloads — order is identity.
							<div key={i}>
								<dt>
									<code>{p.name}</code>: <code>{p.type ?? DEFAULT_TYPE}</code>
									{p.optional && <> (optional)</>}
								</dt>
								{p.description && <dd>{p.description}</dd>}
							</div>
						))}
					</dl>
				</section>
			)}
			{returns && returns.length > 0 && (
				<section>
					<h2>Returns</h2>
					<dl>
						{returns.map((r, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: returns can repeat across overloads — order is identity.
							<div key={i}>
								<dt>
									<code>{r.type ?? DEFAULT_TYPE}</code>
								</dt>
								{r.description && <dd>{r.description}</dd>}
							</div>
						))}
					</dl>
				</section>
			)}
			{throws && throws.length > 0 && (
				<section>
					<h2>Throws</h2>
					<dl>
						{throws.map((t, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: throws can repeat — order is identity.
							<div key={i}>
								<dt>
									<code>{t.type ?? DEFAULT_TYPE}</code>
								</dt>
								{t.description && <dd>{t.description}</dd>}
							</div>
						))}
					</dl>
				</section>
			)}
			{examples && examples.length > 0 && (
				<section>
					<h2>Examples</h2>
					{examples.map((e, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: examples have no stable identity beyond order.
						<pre key={i}>
							<code>{e.description}</code>
						</pre>
					))}
				</section>
			)}
			{children && <TreeCards>{children}</TreeCards>}
		</Page>
	);
}

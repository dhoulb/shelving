import type { ReactElement, ReactNode } from "react";
import type { DocsSymbol } from "../../util/docs.js";
import { requireSlug } from "../../util/string.js";
import { Tag } from "../inline/Tag.js";
import type { Status } from "../notice/Status.js";
import styles from "./DocsSymbolCard.module.css";

/** Status-variant colour for each symbol kind. Drives the kind tag rendered next to a symbol's name. */
export const DOCS_SYMBOL_KIND_STATUS: Record<DocsSymbol["kind"], Status> = {
	function: "primary",
	class: "secondary",
	interface: "tertiary",
	type: "highlight",
	constant: "info",
	method: "primary",
	property: "quiet",
};

export interface DocsSymbolCardProps extends DocsSymbol {
	readonly renderMarkdown?: ((text: string) => ReactNode) | undefined;
}

/** Documentation card for a single symbol — name, kind, signatures, params, returns, examples, and any nested members. */
export function DocsSymbolCard({
	name,
	kind,
	description,
	params,
	returns,
	examples,
	signatures = [],
	static: isStatic,
	readonly: isReadonly,
	children,
	renderMarkdown,
}: DocsSymbolCardProps): ReactElement {
	const id = requireSlug(name);
	const status = DOCS_SYMBOL_KIND_STATUS[kind];
	return (
		<section id={id} className={styles.card}>
			<header className={styles.head}>
				<h2 className={styles.name}>{name}</h2>
				<Tag {...{ [status]: true }}>{kind}</Tag>
				{isStatic ? <Tag highlight>static</Tag> : null}
				{isReadonly ? <Tag quiet>readonly</Tag> : null}
			</header>
			{signatures.length ? (
				<div className={styles.signatures}>
					{signatures.map(sig => (
						<code key={sig} className={styles.signature}>
							{sig}
						</code>
					))}
				</div>
			) : null}
			{description ? <div>{renderMarkdown ? renderMarkdown(description) : description}</div> : null}
			{params?.length ? (
				<div className={styles.section}>
					<h3 className={styles.sectionTitle}>Parameters</h3>
					<ul className={styles.params}>
						{params.map(param => (
							<li key={`${param.name}|${param.type}`} className={styles.param}>
								<code className={styles.paramName}>{param.name}</code>
								<code className={styles.paramType}>{`: ${param.type}`}</code>
								{param.description ? <div className={styles.paramDescription}>{param.description}</div> : null}
							</li>
						))}
					</ul>
				</div>
			) : null}
			{returns?.length ? (
				<div className={styles.section}>
					<h3 className={styles.sectionTitle}>Returns</h3>
					<div className={styles.returns}>
						{returns.map(ret => (
							<div key={`${ret.type}|${ret.description ?? ""}`}>
								<code className={styles.returnType}>{ret.type}</code>
								{ret.description ? <div className={styles.returnDescription}>{ret.description}</div> : null}
							</div>
						))}
					</div>
				</div>
			) : null}
			{examples?.length ? (
				<div className={styles.section}>
					<h3 className={styles.sectionTitle}>Examples</h3>
					{examples.map(example => (
						<pre key={example} className={styles.example}>
							<code>{example}</code>
						</pre>
					))}
				</div>
			) : null}
			{children?.length ? (
				<div className={styles.children}>
					{children.map(child => (
						<DocsSymbolCard key={child.name} {...child} renderMarkdown={renderMarkdown} />
					))}
				</div>
			) : null}
		</section>
	);
}

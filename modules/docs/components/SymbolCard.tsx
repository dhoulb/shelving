import { requireSlug } from "../../util/string.js";
import type { SymbolNode } from "../util/nodes.js";
import { TOKEN_KIND_COLORS } from "../util/style.js";
import { Badge } from "./Badge.js";

/** Documentation card for a given symbol node. */
export function SymbolCard({
	name,
	kind,
	description,
	params = [],
	returns,
	examples = [],
	signatures = [],
	static: isStatic,
	readonly: isReadonly,
	children = [],
}: SymbolNode) {
	const id = requireSlug(name);
	const color = TOKEN_KIND_COLORS[kind];

	return (
		<section id={id} style={{ paddingBottom: "32px", marginTop: "24px", marginBottom: "24px" }}>
			<div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
				<h2 style={{ margin: 0, color: "#f1f2f4", fontSize: "20px" }}>{name}</h2>
				<Badge label={kind} color={color} />
				{isStatic ? <Badge label="static" color="pink" /> : null}
				{isReadonly ? <Badge label="readonly" color="pink" /> : null}
			</div>

			{signatures.length ? (
				<div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
					{signatures.map(sig => (
						<code
							key={sig}
							style={{
								display: "inline-block",
								padding: "8px 10px",
								backgroundColor: "#2e3238",
								borderRadius: "6px",
								color: "#f1f2f4",
								fontFamily:
									"ui-monospace, SFMono-Regular, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
							}}
						>
							{sig}
						</code>
					))}
				</div>
			) : null}

			{description ? <div style={{ marginTop: "12px", color: "#abb1ba", lineHeight: 1.6, fontSize: "14px" }}>{description}</div> : null}

			{params.length ? (
				<div style={{ marginTop: "12px" }}>
					<h3 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#f1f2f4" }}>Parameters</h3>
					<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
						{params.map(param => (
							<li key={param.name} style={{ marginBottom: "8px", color: "#abb1ba" }}>
								<code style={{ color: "#92f416", marginRight: "8px" }}>{param.name}</code>
								<span
									style={{
										color: "#15f4e5",
										fontFamily:
											"ui-monospace, SFMono-Regular, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
									}}
								>
									{`: ${param.type}`}
								</span>
								{param.description ? <div style={{ marginTop: "4px", color: "#abb1ba" }}>{param.description}</div> : null}
							</li>
						))}
					</ul>
				</div>
			) : null}

			{returns?.length ? (
				<div style={{ marginTop: "12px" }}>
					<h3 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#f1f2f4" }}>Returns</h3>
					<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
						{returns.map(ret => (
							<div key={`${ret.type}|${ret.description ?? ""}`}>
								<code
									style={{
										color: "#15f4e5",
										backgroundColor: "#2e3238",
										padding: "6px 8px",
										borderRadius: "4px",
										display: "inline-block",
									}}
								>
									{ret.type}
								</code>
								{ret.description ? <div style={{ color: "#abb1ba", marginTop: "2px" }}>{ret.description}</div> : null}
							</div>
						))}
					</div>
				</div>
			) : null}

			{examples.length ? (
				<div style={{ marginTop: "12px" }}>
					<h3 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#f1f2f4" }}>Examples</h3>
					{examples.map(example => (
						<pre
							key={example}
							style={{
								backgroundColor: "#2e3238",
								color: "#f1f2f4",
								padding: "12px",
								borderRadius: "8px",
								overflowX: "auto",
								whiteSpace: "pre-wrap",
							}}
						>
							<code>{example}</code>
						</pre>
					))}
				</div>
			) : null}

			{children.length ? (
				<div style={{ marginTop: "16px" }}>
					{children.map(child => (
						<SymbolCard key={child.name} {...child} />
					))}
				</div>
			) : null}
		</section>
	);
}

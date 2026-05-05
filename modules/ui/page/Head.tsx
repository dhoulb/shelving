import { type ReactElement, useEffect } from "react";
import { getProps, isDefined, notNullish } from "shelving";
import { requireMeta } from "../misc/Meta.js";
import { joinTitles } from "../util/meta.js";

/** Meta tags with a capital first letter and hyphens, e.g. `Content-Security-Policy` or `Accept`, are `http-equiv=""` tags. */
const R_HTTP_EQUIV = /^[A-Z][a-zA-Z0-9]*(-[A-Z][a-zA-Z0-9]*)*$/;

declare const _componentProps: unique symbol;

export interface HeadProps {
	readonly [_componentProps]?: never;
}

/** Use the details from the current page data context to set the document `<title>`, meta tags, and history state. */
export function Head(): ReactElement {
	const { url, title, base, app, links, tags } = requireMeta();

	useEffect(() => {
		if (url) window.history.replaceState(null, "", url);
	}, [url]);

	return (
		<>
			<title>{joinTitles(title, app)}</title>
			{base && <base href={base.href} />}
			{tags &&
				getProps(tags)
					.map(([k, x]) => {
						if (notNullish(x)) {
							const y = x === true ? "yes" : x === false ? "no" : x;
							if (k.startsWith("og:")) return <meta key={k} property={k} content={y} />; // Tags that start with `og:` use `property=""`
							if (k.match(R_HTTP_EQUIV)) return <meta key={k} httpEquiv={k} content={y} />; // Tags that are in `Snake-Case` use `http-equiv=""`
							return <meta key={k} name={k} content={y} />; // All other tags use `content=""`
						}
						return null;
					})
					.filter(isDefined)}
			{links &&
				getProps(links).map(([k, v]) =>
					notNullish(v) ? (
						<link key={k} rel={k} href={v} type={v.endsWith(".png") ? "image/png" : v.endsWith(".ico") ? "image/x-icon" : undefined} />
					) : null,
				)}
		</>
	);
}

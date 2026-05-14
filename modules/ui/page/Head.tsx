import { type ReactElement, useEffect } from "react";
import type { ArrayItem } from "../../util/array.js";
import { isNullish, notNullish } from "../../util/null.js";
import { getProps, type Prop } from "../../util/object.js";
import { requireMeta } from "../misc/MetaContext.js";
import { joinTitles, type MetaAssets, type MetaLinks, type MetaTags } from "../util/meta.js";

/** Meta tags with a capital first letter and hyphens, e.g. `Content-Security-Policy` or `Accept`, are `http-equiv=""` tags. */
const R_HTTP_EQUIV = /^[A-Z][a-zA-Z0-9]*(-[A-Z][a-zA-Z0-9]*)*$/;

/**
 * Per-page meta tags plus history navigation.
 * - Emits hoistable head elements (title, meta, links, stylesheets, scripts) inline; React 19 hoists each one into the document `<head>`.
 * - Does not render `<base>` (not hoistable — that lives in `<Head>` in the `<HTML>` shell component).
 * - Updates `window.history` to match the page URL.
 */
export function Head(): ReactElement {
	const meta = requireMeta();
	const { url, title, app, links, tags, stylesheets, modules, scripts } = meta;

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (url) window.history.replaceState(null, "", url);
	}, [url]);

	const fullTitle = joinTitles(title, app);
	return (
		<>
			{fullTitle && <title>{fullTitle}</title>}
			{tags && getProps(tags).map(_renderTag)}
			{links && getProps(links).map(_renderLink)}
			{stylesheets?.map(_renderStylesheet)}
			{modules?.map(_renderModule)}
			{scripts?.map(_renderScript)}
		</>
	);
}

function _renderTag([k, x]: Prop<MetaTags>): ReactElement | null {
	if (notNullish(x)) {
		const y = x === true ? "yes" : x === false ? "no" : x;
		if (k.startsWith("og:")) return <meta key={k} property={k} content={y} />; // Tags that start with `og:` use `property=""`
		if (k.match(R_HTTP_EQUIV)) return <meta key={k} httpEquiv={k} content={y} />; // Tags that are in `Snake-Case` use `http-equiv=""`
		return <meta key={k} name={k} content={y} />; // All other tags use `content=""`
	}
	return null;
}

function _renderLink([k, v]: Prop<MetaLinks>): ReactElement | null {
	if (notNullish(v)) {
		const type = k.endsWith("icon") ? "image/x-icon" : "text/css";
		return <link key={k} rel={k} href={v} type={type} />;
	}
	return null;
}

function _renderStylesheet(v: ArrayItem<MetaAssets>): ReactElement | null {
	return isNullish(v) ? null : <link key={v} rel="stylesheet" type="text/css" href={v} precedence="default" />;
}

function _renderModule(v: ArrayItem<MetaAssets>): ReactElement | null {
	return isNullish(v) ? null : <script key={v} type="module" src={v} async={true} />;
}

function _renderScript(v: ArrayItem<MetaAssets>): ReactElement | null {
	return isNullish(v) ? null : <script key={v} type="text/javascript" src={v} async={true} />;
}

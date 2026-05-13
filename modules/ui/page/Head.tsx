import { type ReactElement, useEffect } from "react";
import type { ArrayItem } from "../../util/array.js";
import { isNullish, notNullish } from "../../util/null.js";
import { getProps, type Prop } from "../../util/object.js";
import { requireMeta } from "../misc/Meta.js";
import { joinTitles, type MetaAssets, type MetaLinks, type MetaTags } from "../util/meta.js";

/** Meta tags with a capital first letter and hyphens, e.g. `Content-Security-Policy` or `Accept`, are `http-equiv=""` tags. */
const R_HTTP_EQUIV = /^[A-Z][a-zA-Z0-9]*(-[A-Z][a-zA-Z0-9]*)*$/;

/** Use the details from the current page data context to set the document `<title>`, meta tags, and history state. */
export function Head(): ReactElement {
	const { url, title, base, app, links, tags, styles, modules, scripts } = requireMeta();

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (url) window.history.replaceState(null, "", url);
	}, [url]);

	return (
		<head>
			<title>{joinTitles(title, app)}</title>
			{base && <base href={base.href} />}
			{tags && getProps(tags).map(_renderTags)}
			{links && getProps(links).map(_renderLinks)}
			{styles?.map(_renderStyles)}
			{modules?.map(_renderModules)}
			{scripts?.map(_renderScripts)}
		</head>
	);
}

function _renderTags([k, x]: Prop<MetaTags>): ReactElement | null {
	if (notNullish(x)) {
		const y = x === true ? "yes" : x === false ? "no" : x;
		if (k.startsWith("og:")) return <meta key={k} property={k} content={y} />; // Tags that start with `og:` use `property=""`
		if (k.match(R_HTTP_EQUIV)) return <meta key={k} httpEquiv={k} content={y} />; // Tags that are in `Snake-Case` use `http-equiv=""`
		return <meta key={k} name={k} content={y} />; // All other tags use `content=""`
	}
	return null;
}

function _renderLinks([k, v]: Prop<MetaLinks>): ReactElement | null {
	if (notNullish(v)) {
		const type = k.endsWith("icon") ? "image/x-icon" : "text/css";
		return <link key={k} rel={k} href={v} type={type} />;
	}
	return null;
}

function _renderStyles(v: ArrayItem<MetaAssets>): ReactElement | null {
	return isNullish(v) ? null : <link key={v} rel="stylesheet" type="text/css" href={v} />;
}

function _renderModules(v: ArrayItem<MetaAssets>): ReactElement | null {
	return isNullish(v) ? null : <script key={v} type="module" src={v} defer />;
}

function _renderScripts(v: ArrayItem<MetaAssets>): ReactElement | null {
	return isNullish(v) ? null : <script key={v} type="text/javascript" src={v} defer />;
}

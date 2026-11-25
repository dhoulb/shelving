import { type ReactElement, use, useEffect } from "react";
import type { ArrayItem } from "../../util/array.js";
import { getProps, type Prop } from "../../util/object.js";
import { runSequence } from "../../util/sequence.js";
import { requireMeta } from "../misc/MetaContext.js";
import { NavigationContext } from "../router/NavigationContext.js";
import type { NavigationSequence } from "../router/NavigationSequence.js";
import { joinTitles, type MetaAssets, type MetaLinks, type MetaTags } from "../util/meta.js";
import { getMetaDepth } from "./depth.js";

/** Meta tags with a capital first letter and hyphens, e.g. `Content-Security-Policy` or `Accept`, are `http-equiv=""` tags. */
const R_HTTP_EQUIV = /^[A-Z][a-zA-Z0-9]*(-[A-Z][a-zA-Z0-9]*)*$/;

/**
 * Emit the current page's head metadata, and replace the browser URL with the page's canonical URL.
 * - On the server, emits hoistable head elements (title, meta, links, stylesheets, scripts) inline; React 19 hoists each one into the document `<head>`.
 * - In the browser, it emits only links, stylesheets and scripts, and sets `document.title`. The browser ignores the other tags after the page loads (only crawlers and link previews read them, from the server HTML), and React never removes duplicate `<title>` and `<meta>` tags, so each nested or stacked `<Page>` would add its own copies.
 * - In the browser, the title is the title of the deepest `<Page>` on the page the browser history is on (the same `stack` and `ordinal`). It updates on each navigation, so a page kept in its stack (for swipe-back) gets its title back when you return to it.
 * - Does not render `<base>` (not hoistable — that lives in `<Head>` in the `<HTML>` shell component).
 * - When the meta `url` differs from the browser URL (a page that knows its canonical URL), calls `NavigationSequence.replace()` with it. It only does this for the page the browser history is on (the same `stack` and `ordinal`), so a page shown ahead of history, such as a swipe-back preview, leaves history alone. Outside `<Navigation>` it does not touch history.
 *
 * @kind component
 * @see https://shelving.cc/ui/Head
 */
export function Head(): ReactElement {
	const meta = requireMeta();
	const { url, title, app, description, links, tags, stylesheets, modules, scripts } = meta;

	// A page can set its canonical URL in meta. Replace the browser URL with it, through the navigation sequence so the history entry keeps its stack.
	// Only for the page history is on: a page shown ahead of history (a swipe-back preview) must not change it.
	const nav = use(NavigationContext);
	const { stack = null, ordinal } = meta;
	useEffect(() => {
		if (!nav || !url) return;
		const current = nav.current();
		if (current.stack === stack && current.ordinal === ordinal && url.href !== current.url.href) nav.replace(url);
	}, [nav, url, stack, ordinal]);

	const fullTitle = joinTitles(title, app);

	// In the browser, set the document title from the deepest page the browser history is on.
	const depth = getMetaDepth(meta);
	useEffect(() => {
		if (!fullTitle) return;
		const head: _TitleHead = { title: fullTitle, depth, stack, ordinal, nav };
		_HEADS.add(head);
		_queueTitle();
		const stop = nav && runSequence(nav, _queueTitle);
		return () => {
			stop?.();
			_HEADS.delete(head);
			_queueTitle();
		};
	}, [fullTitle, depth, stack, ordinal, nav]);

	const server = typeof document === "undefined";
	return (
		<>
			{server && fullTitle && <title>{fullTitle}</title>}
			{server && description && <meta name="description" content={description} />}
			{server && tags && getProps(tags).map(_renderTag)}
			{links && getProps(links).map(_renderLink)}
			{stylesheets?.map(_renderStylesheet)}
			{modules?.map(_renderModule)}
			{scripts?.map(_renderScript)}
		</>
	);
}

type _TitleHead = {
	readonly title: string;
	readonly depth: number;
	readonly stack: string | null;
	readonly ordinal: number | undefined;
	readonly nav: NavigationSequence | undefined;
};

/** Each `<Head>` in the browser that has a title. */
const _HEADS = new Set<_TitleHead>();

let _queued = false;

/** Set the document title once, after every head in this change has updated. */
function _queueTitle(): void {
	if (_queued) return;
	_queued = true;
	queueMicrotask(() => {
		_queued = false;
		let title: string | undefined;
		let depth = -1;
		for (const head of _HEADS) {
			if (head.nav) {
				const current = head.nav.current();
				if (current.stack !== head.stack || current.ordinal !== head.ordinal) continue;
			}
			if (head.depth >= depth) {
				title = head.title;
				depth = head.depth;
			}
		}
		if (title !== undefined && document.title !== title) document.title = title;
	});
}

function _renderTag([k, x]: Prop<MetaTags>): ReactElement | null {
	if (x === null || x === undefined) return null;
	const y = x === true ? "yes" : x === false ? "no" : x;
	if (k.startsWith("og:")) return <meta key={k} property={k} content={y} />; // Tags that start with `og:` use `property=""`
	if (k.match(R_HTTP_EQUIV)) return <meta key={k} httpEquiv={k} content={y} />; // Tags that are in `Snake-Case` use `http-equiv=""`
	return <meta key={k} name={k} content={y} />; // All other tags use `content=""`
}

function _renderLink([k, { href }]: Prop<MetaLinks>): ReactElement | null {
	const type = k.endsWith("icon") ? "image/x-icon" : "text/css";
	return <link key={k} rel={k} href={href} type={type} />;
}

function _renderStylesheet({ href }: ArrayItem<MetaAssets>): ReactElement | null {
	return <link key={href} rel="stylesheet" type="text/css" href={href} precedence="default" />;
}

function _renderModule({ href }: ArrayItem<MetaAssets>): ReactElement | null {
	return <script key={href} type="module" src={href} async={true} />;
}

function _renderScript({ href }: ArrayItem<MetaAssets>): ReactElement | null {
	return <script key={href} type="text/javascript" src={href} async={true} />;
}

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { Meta } from "../ui/misc/Meta.js";
import { type PossibleURL, requireURL } from "../util/url.js";

/**
 * Render a React tree to an HTML string for a given URL.
 * - Wraps `app` in `<Meta url={url} base={base}>` so descendants (Router, Head, etc.) read the URL/base from Meta.
 * - Auto-prepends `<!DOCTYPE html>` if the rendered output starts with `<html` (i.e. `<HTML>` is at the root).
 *
 * Uses `renderToString` so React 19's metadata hoisting kicks in: any `<title>`,
 * `<meta>`, `<link>`, or `<script>` rendered anywhere in the tree (typically by `<Head>`
 * inside `<Page>`) is hoisted into a generated `<head>` element of the document. The
 * same tree works for client mounting via `hydrateRoot()` — React hoists head tags into
 * `document.head` on the client. This is the property that lets one component tree
 * serve both static SSR and client-mounted SPA modes.
 *
 * @param app The React element to render — typically an app root containing `<HTML>`.
 * @param url The URL of the route being rendered. Forwarded to descendants via `<Meta url={url}>`.
 * @param base Optional base URL. Forwarded to descendants via `<Meta base={base}>`.
 * @returns The rendered HTML string.
 *
 * @example
 *   renderRoute(<MyApp />, "/users/123");
 *   renderRoute(<MyApp />, "/users/123", "https://app.example.com");
 */
export function renderRoute(app: ReactElement, url: PossibleURL, base?: PossibleURL): string {
	const html = renderToString(
		<Meta url={url} base={base ? requireURL(base) : undefined}>
			{app}
		</Meta>,
	);
	return html.trimStart().startsWith("<html") ? `<!DOCTYPE html>${html}` : html;
}

/**
 * Render multiple URLs through the same React tree.
 * - Returns a record keyed by `String(url)` exactly as the caller passed it.
 *
 * @param app The React element to render for every URL.
 * @param urls The URLs to render.
 * @param base Optional base URL forwarded to every render.
 * @returns A dictionary of `url → html` for every input URL.
 */
export function renderRoutes(app: ReactElement, urls: readonly PossibleURL[], base?: PossibleURL): { readonly [url: string]: string } {
	const out: Record<string, string> = {};
	for (const url of urls) out[String(url)] = renderRoute(app, url, base);
	return out;
}

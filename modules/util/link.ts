import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import { isAbsolutePath, type Path } from "./path.js";
import { getURI, type ImmutableURI, type URIString } from "./uri.js";
import { getURL, type ImmutableURL } from "./url.js";

/**
 * RFC 3986 scheme detector — `scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )` followed by a colon.
 * - Used to distinguish a scheme-prefixed URI string (e.g. `mailto:foo`, `tel:123`, `https://x.com`) from a relative path that happens to contain a colon later on.
 * - Avoids depending on `document.baseURI` (which `getURI` falls back to in browsers) for the classification.
 */
const _R_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/** Anything that can be turned into an `<a href>` value — a site/relative path, a URI string, or a `URL` instance. */
export type PossibleLink = Path | ImmutableURI | URIString;

/**
 * Resolve a possible link to an absolute URI string, or return `undefined` if resolution fails.
 *
 * Classification:
 * - **`URL` instance** → returns its `.href` directly.
 * - **Absolute path** (starts with `/`, e.g. `/schema`) → resolved against `root` (the site root). The leading `/` is dot-prefixed first so the resolution honors `root`'s subfolder — `/schema` against `https://x.com/app/` becomes `https://x.com/app/schema`, not `https://x.com/schema`.
 * - **Scheme-prefixed URI string** (matches `^[a-z][a-z0-9+.-]*:`, e.g. `mailto:a@b`, `tel:123`, `https://x.com/y`) → returned as-is (via `getURI`).
 * - **Anything else** — relative path, fragment, query, or bare segment (e.g. `./foo`, `../foo`, `foo`, `#anchor`, `?q=1`) → resolved against `url` (the current page URL).
 *
 * Fallbacks:
 * - If `root` is omitted, absolute paths resolve against `url` using `new URL()`'s default semantics (host root of `url`'s origin) — the dot-prefix trick only applies when an explicit `root` is given.
 * - If `url` is omitted, relative refs fall back to `root` so they still have somewhere to anchor.
 *
 * Bases are passed through to `getURL` / `getURI` lazily — neither `url` nor `root` is touched unless the chosen branch needs it, matching `getURL`'s pattern.
 *
 * @param link The link to resolve. Strings are classified by shape; `URL` instances pass through.
 * @param url The current page URL — used as the base for relative refs.
 * @param root The site root URL — used as the base for absolute paths.
 * @returns An absolute URI string, or `undefined` if `link` is missing, not a string/URL, or cannot be resolved.
 *
 * @example getLink("/schema", pageURL, siteRoot) // → "https://x.com/app/schema" when siteRoot is "https://x.com/app/"
 * @example getLink("./db", new URL("https://x.com/app/schema/")) // → "https://x.com/app/schema/db"
 * @example getLink("mailto:a@b") // → "mailto:a@b"
 */
export function getLink(link: unknown, url?: ImmutableURL, root?: ImmutableURL): URIString | undefined {
	if (!link) return;
	if (link instanceof URL) return link.href as URIString;
	if (typeof link !== "string") return;

	// Absolute path — resolve against `root` (with dot-prefix to honor its subfolder), or against `url` with URL-spec default if no root.
	if (isAbsolutePath(link)) return root ? getURL(`.${link}`, root)?.href : getURL(link, url)?.href;

	// Scheme-prefixed URI (mailto:, tel:, https://, …) — pass through via `getURI`. Avoids the `document.baseURI` fallback in browsers.
	if (_R_SCHEME.test(link)) return getURI(link)?.href;

	// Anything else — relative ref. Resolve against `url`, falling back to `root`.
	return getURL(link, url ?? root)?.href;
}

/**
 * Resolve a possible link to an absolute URI string, or throw `RequiredError` if resolution fails.
 *
 * Same classification and fallback rules as `getLink`. Use when an absolute URI is required and there's no sensible "do nothing" path for the caller.
 *
 * @param link The link to resolve.
 * @param url The current page URL — used as the base for relative refs.
 * @param root The site root URL — used as the base for absolute paths.
 * @param caller Identity of the calling function for error attribution.
 * @returns An absolute URI string.
 * @throws `RequiredError` if `link` cannot be resolved.
 */
export function requireLink(link: PossibleLink, url?: ImmutableURL, root?: ImmutableURL, caller: AnyCaller = requireLink): URIString {
	const href = getLink(link, url, root);
	if (!href) throw new RequiredError("Invalid link", { received: link, caller });
	return href;
}

import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import { isAbsolutePath, type Path } from "./path.js";
import { getURI, type ImmutableURI, type URIString } from "./uri.js";
import { getURL, type ImmutableURL } from "./url.js";

/** Anything that can be turned into an `<a href>` value — a site/relative path, a URI string, or a `URL` instance. */
export type PossibleLink = Path | ImmutableURI | URIString;

/**
 * Resolve a possible link to an absolute URI string, or return `undefined` if resolution fails.
 *
 * Classification:
 * - **`URL` instance** → returns its `.href` directly.
 * - **Absolute path** (starts with `/`, e.g. `/schema`) → resolved against `root` with a dot prefix so the resolution honors `root`'s subfolder — `/schema` against `https://x.com/app/` becomes `https://x.com/app/schema`, not `https://x.com/schema`.
 * - **Anything else** — relative ref (`./foo`, `../foo`, `foo`, `#anchor`, `?q`) or scheme-prefixed URI (`mailto:a@b`, `tel:123`, `https://x.com/y`) → fed to `getURI` with `url` as the base. Self-contained URIs ignore the base (their own scheme makes them absolute); relative refs resolve against the page URL.
 *
 * Defaults:
 * - `root` defaults to `url`, so passing only `url` makes absolute paths resolve under the page URL's directory (same coordinate space the page lives in).
 * - When both are omitted, all branches return `undefined` (no base to resolve against).
 *
 * Bases are passed through to `getURL` / `getURI` lazily — neither `url` nor `root` is materialised into a normalised base until the chosen branch needs it.
 *
 * @param link The link to resolve. Strings are classified by shape; `URL` instances pass through.
 * @param url The current page URL — base for relative refs and scheme-prefixed URIs.
 * @param root The site root URL — base for absolute paths. Defaults to `url`.
 * @returns An absolute URI string, or `undefined` if `link` is missing, not a string/URL, or cannot be resolved.
 *
 * @example getLink("/schema", pageURL, siteRoot) // → "https://x.com/app/schema" when siteRoot is "https://x.com/app/"
 * @example getLink("./db", new URL("https://x.com/app/schema/")) // → "https://x.com/app/schema/db"
 * @example getLink("mailto:a@b") // → "mailto:a@b"
 */
export function getLink(link: unknown, url?: ImmutableURL, root: ImmutableURL | undefined = url): URIString | undefined {
	if (!link) return;
	if (link instanceof URL) return link.href as URIString;
	if (typeof link !== "string") return;
	if (isAbsolutePath(link)) return getURL(`.${link}`, root)?.href;
	return getURI(link, url ?? root)?.href;
}

/**
 * Resolve a possible link to an absolute URI string, or throw `RequiredError` if resolution fails.
 *
 * Same classification and defaults as `getLink`. Use when an absolute URI is required and there's no sensible "do nothing" path for the caller.
 *
 * @param link The link to resolve.
 * @param url The current page URL — base for relative refs and scheme-prefixed URIs.
 * @param root The site root URL — base for absolute paths. Defaults to `url`.
 * @param caller Identity of the calling function for error attribution.
 * @returns An absolute URI string.
 * @throws `RequiredError` if `link` cannot be resolved.
 */
export function requireLink(link: PossibleLink, url?: ImmutableURL, root?: ImmutableURL, caller: AnyCaller = requireLink): URIString {
	const href = getLink(link, url, root);
	if (!href) throw new RequiredError("Invalid link", { received: link, caller });
	return href;
}

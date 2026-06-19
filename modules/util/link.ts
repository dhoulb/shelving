import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import type { Nullish } from "./null.js";
import { isAbsolutePath } from "./path.js";
import { type ImmutableURI, isURI, type PossibleURI } from "./uri.js";
import { getBasedURI, getURL, type ImmutableURL } from "./url.js";

/**
 * Anything that can be turned into an `<a href>`.
 *
 * @see https://dhoulb.github.io/shelving/util/link/PossibleLink
 */
export type PossibleLink = PossibleURI;

/**
 * Resolve a possible link to an absolute URI string, or return `undefined` if resolution fails.
 *
 * Classification:
 * - **`URL` instance** → returns its `.href` directly.
 * - **Absolute path** (single leading `/`, e.g. `/schema`) → resolved against `root` with a dot prefix so the resolution honors `root`'s subfolder — `/schema` against `https://x.com/app/` becomes `https://x.com/app/schema`, not `https://x.com/schema`.
 * - **Anything else** — relative ref (`./foo`, `../foo`, `foo`, `#anchor`, `?q`), protocol-relative URL (`//host/path`), or scheme-prefixed URI (`mailto:a@b`, `tel:123`, `https://x.com/y`) → fed to `getBasedURI()` with `url` as the base. Self-contained URIs ignore the base (their own scheme makes them absolute); protocol-relative and relative refs resolve against the page URL.
 *
 * Defaults:
 * - `root` defaults to `url`, so passing only `url` makes absolute paths resolve under the page URL's directory (same coordinate space the page lives in).
 * - When both are omitted, all branches return `undefined` (no base to resolve against).
 *
 * Bases are passed through to `getURL()` / `getBasedURI()` lazily — neither `url` nor `root` is materialised into a normalised base until the chosen branch needs it.
 *
 * @param href The link to resolve. Strings are classified by shape; `URL` instances pass through.
 * @param url The current page URL — base for relative refs and scheme-prefixed URIs.
 * @param root The site root URL — base for absolute paths. Defaults to `url`.
 * @returns An absolute URI object, or `undefined` if `link` is missing, not a string/URL, or cannot be resolved.
 *
 * @example getLink("/schema", pageURL, siteRoot) // → "https://x.com/app/schema" when siteRoot is "https://x.com/app/"
 * @example getLink("./db", new URL("https://x.com/app/schema/")) // → "https://x.com/app/schema/db"
 * @example getLink("mailto:a@b") // → "mailto:a@b"
 * @see https://dhoulb.github.io/shelving/util/link/getLink
 */
export function getLink(href: Nullish<PossibleLink>, url?: ImmutableURL, root: ImmutableURL | undefined = url): ImmutableURI | undefined {
	if (!href) return;
	if (isURI(href)) return href;
	if (typeof href !== "string") return;
	// Single leading slash is a site-absolute path; `//` is a protocol-relative URL and falls through to `getBasedURI`.
	if (isAbsolutePath(href) && !href.startsWith("//")) return getURL(`.${href}`, root);
	return getBasedURI(href, url ?? root);
}

/**
 * Resolve a possible link to an absolute URI string, or throw `RequiredError` if resolution fails.
 *
 * Same classification and defaults as `getLink()`. Use when an absolute URI is required and there's no sensible "do nothing" path for the caller.
 *
 * @param href The link to resolve.
 * @param url The current page URL — base for relative refs and scheme-prefixed URIs.
 * @param root The site root URL — base for absolute paths. Defaults to `url`.
 * @param caller Function to attribute a thrown error to (defaults to `requireLink` itself).
 * @returns An absolute URI string.
 * @throws {RequiredError} If `href` cannot be resolved.
 * @example requireLink("mailto:a@b") // → "mailto:a@b"
 * @see https://dhoulb.github.io/shelving/util/link/requireLink
 */
export function requireLink(href: PossibleLink, url?: ImmutableURL, root?: ImmutableURL, caller: AnyCaller = requireLink): ImmutableURI {
	const uri = getLink(href, url, root);
	if (!uri) throw new RequiredError("Invalid link", { received: href, caller });
	return uri;
}

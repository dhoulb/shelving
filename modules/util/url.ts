import { getRequired } from "./data.js";

/** Just get important part of a URL, e.g. `http://shax.com/test?uid=129483` → `shax.com/test` */
export const formatUrl = (url: string | URL): string => {
	const { host, pathname } = getRequired(toURL(url));
	return `${host}${pathname.length > 1 ? pathname : ""}`;
};

/**
 * Convert a string to a URL instance or return `null` if we can't.
 * - Automatically prepend `https://` if there's no `:` anywhere.
 *
 * @param url Base
 * @param
 */
export function toURL(url: string | URL, base: URL | string | undefined = typeof window === "object" ? window.location.href : undefined): URL | null {
	if (url instanceof URL) return url;
	if (!url) return null;
	try {
		return new URL(url, base);
	} catch (e) {
		return null;
	}
}

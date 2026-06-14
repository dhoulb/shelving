import { getGetter, getSetter } from "../util/class.js";
import type { AnyCaller } from "../util/function.js";
import type { AbsolutePath } from "../util/index.js";
import {
	clearURIParams,
	getURIParam,
	getURIParams,
	omitURIParams,
	type PossibleURIParams,
	requireURIParam,
	type URIParams,
	type URIScheme,
	withURIParam,
	withURIParams,
} from "../util/uri.js";
import { getURL, type ImmutableURL, isURLActive, isURLProud, type PossibleURL, requireURL, type URLString } from "../util/url.js";
import { BusyStore } from "./BusyStore.js";

/**
 * Store a URL, e.g. `https://top.com/a/b/c`
 * - Accepts any `PossibleURL` as input and normalises it to an `ImmutableURL` (resolved against `this.base`).
 * - Exposes the URL's components (`href`, `origin`, `pathname`, etc.) and helpers to read and mutate its search params.
 *
 * @param url The initial URL value.
 * @param base An optional base URL that relative URLs are resolved against.
 * @example
 * const store = new URLStore("https://top.com/a/b/c");
 * store.setParam("page", 2); // https://top.com/a/b/c?page=2
 * store.isActive("https://top.com/a/b/c?page=2"); // true
 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore
 */
export class URLStore extends BusyStore<ImmutableURL, PossibleURL> {
	/**
	 * Base URL that relative URL inputs are resolved against, or `undefined` if none was set.
	 *
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/base
	 */
	readonly base: ImmutableURL | undefined;

	// Override to convert possible URL to URL.
	constructor(url: PossibleURL, base?: PossibleURL) {
		const baseURL = getURL(base);
		super(requireURL(url, baseURL, URLStore));
		this.base = baseURL;
	}

	// Override to convert possible URL to URL (relative to `this.base`).
	protected override _convert(value: PossibleURL, caller: AnyCaller): ImmutableURL {
		return requireURL(value, this.base, caller);
	}

	// Override for fast equality.
	protected override _equal(a: ImmutableURL, b: ImmutableURL): boolean {
		return a.href === b.href;
	}

	/**
	 * Get or set the full URL string (e.g. `https://top.com/a/b/c?x=1`).
	 *
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/href
	 */
	get href(): URLString {
		return this.value.href;
	}
	set href(href: URLString) {
		this.value = href;
	}

	/**
	 * Get the origin of the URL (e.g. `https://top.com`).
	 *
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/origin
	 */
	get origin(): URLString {
		return this.value.origin;
	}

	/**
	 * Get the protocol/scheme of the URL (e.g. `https:`).
	 *
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/protocol
	 */
	get protocol(): URIScheme {
		return this.value.protocol;
	}

	/**
	 * Get the username component of the URL.
	 *
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/username
	 */
	get username(): string {
		return this.value.username;
	}

	/**
	 * Get the password component of the URL.
	 *
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/password
	 */
	get password(): string {
		return this.value.password;
	}

	/**
	 * Get the hostname of the URL (e.g. `top.com`).
	 *
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/hostname
	 */
	get hostname(): string {
		return this.value.hostname;
	}

	/**
	 * Get the host of the URL including port (e.g. `top.com:8080`).
	 *
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/host
	 */
	get host(): string {
		return this.value.host;
	}

	/**
	 * Get the port of the URL, or an empty string if none is set.
	 *
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/port
	 */
	get port(): string {
		return this.value.port;
	}

	/**
	 * Get the absolute pathname of the URL (e.g. `/a/b/c`).
	 *
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/pathname
	 */
	get pathname(): AbsolutePath {
		return this.value.pathname;
	}

	/**
	 * Get the URL params as a query string (e.g. `?x=1&y=2`).
	 *
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/search
	 */
	get search(): string {
		return this.value.search;
	}

	/**
	 * Get the URL params as a dictionary of key/value pairs.
	 *
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/params
	 */
	get params(): URIParams {
		return getURIParams(this.value.searchParams, getGetter(this, "params"));
	}

	/**
	 * Return a single param in this URL, or `undefined` if it could not be found.
	 *
	 * @param key The name of the param to read.
	 * @returns The param value, or `undefined` if it is not present.
	 * @example store.getParam("page"); // "2"
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/getParam
	 */
	getParam(key: string): string | undefined {
		return getURIParam(this.value.searchParams, key);
	}

	/**
	 * Require a single param in this URL, or throw `RequiredError` if it could not be found.
	 *
	 * @param key The name of the param to read.
	 * @returns The param value.
	 * @throws {RequiredError} If the param is not present.
	 * @example store.requireParam("page");
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/requireParam
	 */
	requireParam(key: string): string | undefined {
		return requireURIParam(this.value.searchParams, key, getSetter(this, "requireParam"));
	}

	/**
	 * Set all params in this URL (all current params are cleared first).
	 *
	 * @param params The complete set of params to set.
	 * @returns Nothing.
	 * @example store.setParams({ page: 2, sort: "name" });
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/setParams
	 */
	setParams(params: PossibleURIParams): void {
		this.value = withURIParams(clearURIParams(this.value, this.setParams), params, this.setParams);
	}

	/**
	 * Set a single named param in this URL.
	 *
	 * @param key The name of the param to set.
	 * @param value The new value for the param.
	 * @returns Nothing.
	 * @example store.setParam("page", 2);
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/setParam
	 */
	setParam(key: string, value: unknown): void {
		this.value = withURIParam(this.value, key, value, this.setParam);
	}

	/**
	 * Update several params in this URL (merged with current params).
	 *
	 * @param params The set of params to merge in.
	 * @returns Nothing.
	 * @example store.updateParams({ sort: "name" });
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/updateParams
	 */
	updateParams(params: PossibleURIParams): void {
		this.value = withURIParams(this.value, params, this.updateParams);
	}

	/**
	 * Delete one or more params from this URL.
	 *
	 * @param key The name of the first param to delete.
	 * @param keys Additional param names to delete.
	 * @returns Nothing.
	 * @example store.deleteParam("page", "sort");
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/deleteParam
	 */
	deleteParam(key: string, ...keys: string[]): void {
		this.value = omitURIParams(this.value, key, ...keys);
	}

	/**
	 * Delete one or more params from this URL.
	 *
	 * @param key The name of the first param to delete.
	 * @param keys Additional param names to delete.
	 * @returns Nothing.
	 * @example store.deleteParams("page", "sort");
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/deleteParams
	 */
	deleteParams(key: string, ...keys: string[]): void {
		this.value = omitURIParams(this.value, key, ...keys);
	}

	/**
	 * Clear all params from this URL.
	 *
	 * @returns Nothing.
	 * @example store.clearParams();
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/clearParams
	 */
	clearParams(): void {
		this.value = clearURIParams(this.value, this.clearParams);
	}

	/**
	 * Return the current URL with an additional param (without mutating this store).
	 *
	 * @param key The name of the param to add.
	 * @param value The value for the param.
	 * @returns A new `ImmutableURL` with the param applied.
	 * @example store.withParam("page", 2);
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/withParam
	 */
	withParam(key: string, value: unknown): ImmutableURL {
		return withURIParam(this.value, key, value, this.withParam);
	}

	/**
	 * Return the current URL with additional params (without mutating this store).
	 *
	 * @param params The params to add.
	 * @returns A new `ImmutableURL` with the params applied.
	 * @example store.withParams({ page: 2, sort: "name" });
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/withParams
	 */
	withParams(params: PossibleURIParams): ImmutableURL {
		return withURIParams(this.value, params, this.withParams);
	}

	/**
	 * Return the current URL with one or more params removed (without mutating this store).
	 *
	 * @param keys The param names to remove.
	 * @returns A new `ImmutableURL` with the params removed.
	 * @example store.omitParams("page", "sort");
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/omitParams
	 */
	omitParams(...keys: string[]): ImmutableURL {
		return omitURIParams(this.value, ...keys);
	}

	/**
	 * Return the current URL with a single param removed (without mutating this store).
	 *
	 * @param key The param name to remove.
	 * @returns A new `ImmutableURL` with the param removed.
	 * @example store.omitParam("page");
	 * @see https://dhoulb.github.io/shelving/store/URLStore/URLStore/omitParam
	 */
	omitParam(key: string): ImmutableURL {
		return omitURIParams(this.value, key);
	}

	/**
	 * Is `target` active relative to this store's URL?
	 * - Active means `target` resolves to the exact same URL as this store's current value.
	 *
	 * @param target URL (or relative path resolved against this store's `base`) to test.
	 */
	isActive(target: PossibleURL): boolean {
		return isURLActive(this.value, requireURL(target, this.base, this.isActive));
	}

	/**
	 * Is `target` proud relative to this store's URL?
	 * - Proud means this store's URL is `target` or a descendant of `target` — i.e. `target` sits at or above the current URL in the hierarchy.
	 * - Useful for marking a menu item as "current branch" when the user is somewhere deeper in its sub-tree.
	 *
	 * @param target URL (or relative path resolved against this store's `base`) to test.
	 */
	isProud(target: PossibleURL): boolean {
		return isURLProud(this.value, requireURL(target, this.base, this.isProud));
	}

	override toString(): string {
		return this.href;
	}
}

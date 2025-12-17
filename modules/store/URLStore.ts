import { getGetter, getSetter } from "../util/class.js";
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
import { getURL, type PossibleURL, requireURL, type URL, type URLString } from "../util/url.js";
import { Store } from "./Store.js";

/** Store a URL, e.g. `https://top.com/a/b/c` */
export class URLStore extends Store<URL> {
	readonly base: URL | undefined;
	constructor(url: PossibleURL, base?: PossibleURL) {
		const baseURL = getURL(base);
		super(requireURL(url, baseURL));
		this.base = baseURL;
	}

	override set value(url: PossibleURL) {
		super.value = requireURL(url, this.base, getSetter(this, "value"));
	}
	override get value(): URL {
		return super.value;
	}

	get href(): URLString {
		return this.value.href;
	}
	set href(href: URLString) {
		this.value = requireURL(href, this.base, getSetter(this, "href"));
	}

	get origin(): URLString {
		return this.value.origin;
	}

	get protocol(): URIScheme {
		return this.value.protocol;
	}

	get username(): string {
		return this.value.username;
	}

	get password(): string {
		return this.value.password;
	}

	get hostname(): string {
		return this.value.hostname;
	}

	get host(): string {
		return this.value.host;
	}

	get port(): string {
		return this.value.port;
	}

	get pathname(): string {
		return this.value.pathname;
	}

	/** Get the URL params as a string. */
	get search(): string {
		return this.value.search;
	}

	/** Get the URL params as a dictionary. */
	get params(): URIParams {
		return getURIParams(this.value.searchParams, getGetter(this, "params"));
	}

	/** Return a single param in this URL, or `undefined` if it could not be found. */
	getParam(key: string): string | undefined {
		return getURIParam(this.value.searchParams, key);
	}

	/** Require a single param in this URL, or throw `RequiredError` if it could not be found. */
	requireParam(key: string): string | undefined {
		return requireURIParam(this.value.searchParams, key, getSetter(this, "requireParam"));
	}

	/** Set all params in this URL (all current params are cleared). */
	setParams(params: PossibleURIParams): void {
		this.value = withURIParams(clearURIParams(this.value, this.setParams), params, this.setParams);
	}

	/** Set a single named param in this URL. */
	setParam(key: string, value: unknown): void {
		this.value = withURIParam(this.value, key, value, this.setParam);
	}

	/** Update several params in this URL (merged with current params). */
	updateParams(params: PossibleURIParams): void {
		this.value = withURIParams(this.value, params, this.updateParams);
	}

	/** Delete one or more params in this URL. */
	deleteParam(key: string, ...keys: string[]): void {
		this.value = omitURIParams(this.value, key, ...keys);
	}

	/** Delete one or more params in this URL. */
	deleteParams(key: string, ...keys: string[]): void {
		this.value = omitURIParams(this.value, key, ...keys);
	}

	/** Clear all params from this URL. */
	clearParams(): void {
		this.value = clearURIParams(this.value, this.clearParams);
	}

	/** Return the current URL with an additional param. */
	withParam(key: string, value: unknown): URL {
		return withURIParam(this.value, key, value, this.withParam);
	}

	/** Return the current URL with an additional param. */
	withParams(params: PossibleURIParams): URL {
		return withURIParams(this.value, params, this.withParams);
	}

	/** Return the current URL with an additional param. */
	omitParams(...keys: string[]): URL {
		return omitURIParams(this.value, ...keys);
	}

	/** Return the current URL with an additional param. */
	omitParam(key: string): URL {
		return omitURIParams(this.value, key);
	}

	// Override `equal()` to just compare the hrefs.
	override equal(a: URL, b: URL): boolean {
		return a.href === b.href;
	}

	override toString(): string {
		return this.href;
	}
}

import { getGetter, getSetter } from "../util/class.js";
import type { Data } from "../util/data.js";
import {
	getURL,
	getURLParam,
	getURLParams,
	omitURLParams,
	type PossibleURL,
	type PossibleURLParams,
	requireURL,
	requireURLParam,
	type URLParams,
	withURLParam,
	withURLParams,
} from "../util/url.js";
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

	get href(): string {
		return this.value.href;
	}
	set href(href: string) {
		this.value = requireURL(href, this.base, getSetter(this, "href"));
	}

	get origin(): string {
		return this.value.origin;
	}

	get protocol(): string {
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
	get params(): URLParams {
		return getURLParams(this.value.searchParams, getGetter(this, "params"));
	}

	/** Return a single param in this URL, or `undefined` if it could not be found. */
	getParam(key: string): string | undefined {
		return getURLParam(this.value.searchParams, key);
	}

	/** Require a single param in this URL, or throw `RequiredError` if it could not be found. */
	requireParam(key: string): string | undefined {
		return requireURLParam(this.value.searchParams, key, getSetter(this, "requireParam"));
	}

	/** Update a single param in this URL. */
	setParam(key: string, value: unknown): void {
		this.value = withURLParam(this.value, key, value, this.setParams);
	}

	/** Update several params in this URL. */
	setParams(params: Data): void {
		this.value = withURLParams(this.value, params, this.setParams);
	}

	/** Delete one or more params in this URL. */
	deleteParam(key: string, ...keys: string[]): void {
		this.value = omitURLParams(this.value, key, ...keys);
	}

	/** Delete one or more params in this URL. */
	deleteParams(key: string, ...keys: string[]): void {
		this.value = omitURLParams(this.value, key, ...keys);
	}

	/** Return the current URL with an additional param. */
	withParam(key: string, value: unknown): URL {
		return withURLParam(this.value, key, value, this.withParam);
	}

	/** Return the current URL with an additional param. */
	withParams(params: PossibleURLParams): URL {
		return withURLParams(this.value, params, this.withParams);
	}

	/** Return the current URL with an additional param. */
	omitParams(...keys: string[]): URL {
		return omitURLParams(this.value, ...keys);
	}

	/** Return the current URL with an additional param. */
	omitParam(key: string): URL {
		return omitURLParams(this.value, key);
	}

	override toString(): string {
		return this.href;
	}
}

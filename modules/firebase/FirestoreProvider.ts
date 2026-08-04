import type { Collection } from "../db/collection/Collection.js";
import { DBProvider } from "../db/provider/DBProvider.js";
import { ResponseError } from "../error/ResponseError.js";
import { UnsupportedError } from "../error/UnsupportedError.js";
import type { ImmutableArray, MutableArray } from "../util/array.js";
import type { Data } from "../util/data.js";
import { joinDataPath } from "../util/data.js";
import type { AnyCaller } from "../util/function.js";
import { BLACKHOLE } from "../util/function.js";
import type { Item, Items, ItemsSequence, OptionalItem, OptionalItemSequence } from "../util/item.js";
import { getItem } from "../util/item.js";
import { isPlainObject } from "../util/object.js";
import { getQueryFilters, getQueryLimit, getQueryOrders, type Query } from "../util/query.js";
import { getRandomKey } from "../util/random.js";
import type { Updates } from "../util/update.js";
import { getUpdates } from "../util/update.js";
import type { FirestoreFields, FirestoreValue } from "./value.js";
import { toData, toFirestoreFields, toFirestoreValue } from "./value.js";

// Constants.
const WRITE_BATCH = 500;
const TRANSACTION_ATTEMPTS = 5;

// Map `Filter.types` to Firestore REST `FieldFilter` operators.
const OPERATORS = {
	is: "EQUAL",
	not: "NOT_EQUAL",
	in: "IN",
	out: "NOT_IN",
	contains: "ARRAY_CONTAINS",
	gt: "GREATER_THAN",
	gte: "GREATER_THAN_OR_EQUAL",
	lt: "LESS_THAN",
	lte: "LESS_THAN_OR_EQUAL",
} as const;

/** JSON representation of a Firestore document in the Firestore REST API. */
type _FirestoreDocument = {
	readonly name: string;
	readonly fields?: FirestoreFields;
};

/** JSON representation of a Firestore REST API `Write` operation. */
type _FirestoreWrite = {
	readonly update?: { readonly name: string; readonly fields: FirestoreFields };
	readonly delete?: string;
	readonly updateMask?: { readonly fieldPaths: ImmutableArray<string> };
	readonly updateTransforms?: ImmutableArray<_FirestoreTransform>;
	readonly currentDocument?: { readonly exists: boolean };
};

/** JSON representation of a Firestore REST API `FieldTransform` operation. */
type _FirestoreTransform = {
	readonly fieldPath: string;
	readonly increment?: FirestoreValue;
	readonly appendMissingElements?: { readonly values: ImmutableArray<FirestoreValue> };
	readonly removeAllFromArray?: { readonly values: ImmutableArray<FirestoreValue> };
};

/** JSON representation of a Firestore REST API `StructuredQuery` (loosely typed — the API is the authority). */
type _FirestoreQuery = {
	from: ImmutableArray<{ collectionId: string }>;
	where?: Data;
	orderBy?: ImmutableArray<Data>;
	limit?: number;
	select?: { fields: ImmutableArray<{ fieldPath: string }> };
};

/** Get the last segment of a Firestore document name, i.e. its id. */
function _getDocumentID<I extends string>(name: string): I {
	return name.slice(name.lastIndexOf("/") + 1) as I; // `as I` needed: Firestore names are always plain strings.
}

/** Convert a Firestore REST document to an `Item`. */
function _getItem<II extends string, TT extends Data>(document: _FirestoreDocument, caller: AnyCaller): Item<II, TT> {
	return getItem(_getDocumentID<II>(document.name), toData(document.fields, caller) as TT); // `as TT` needed: validate with `ValidationDBProvider` for real type safety.
}

/**
 * Convert a query to a Firestore REST `StructuredQuery`, or `undefined` if the query provably matches nothing (e.g. an empty `in` filter).
 * - `id` keys map to the `__name__` field path with document-reference values.
 */
function _getStructuredQuery<II extends string, TT extends Data>(
	root: string,
	collection: string,
	query: Query<Item<II, TT>> | undefined,
	select: boolean,
	caller: AnyCaller,
): _FirestoreQuery | undefined {
	const structured: _FirestoreQuery = { from: [{ collectionId: collection }] };
	const filters: MutableArray<Data> = [];
	if (query) {
		for (const { key, operator, value } of getQueryFilters(query)) {
			const k = joinDataPath(key);
			const fieldPath = k === "id" ? "__name__" : k;
			const encode = (v: unknown): FirestoreValue =>
				k === "id" ? { referenceValue: `${root}/${collection}/${String(v)}` } : toFirestoreValue(v, caller);
			if (value === null && operator === "is") filters.push({ unaryFilter: { op: "IS_NULL", field: { fieldPath } } });
			else if (value === null && operator === "not") filters.push({ unaryFilter: { op: "IS_NOT_NULL", field: { fieldPath } } });
			else if (operator === "in" || operator === "out") {
				const values = value as ImmutableArray<unknown>;
				if (!values.length) {
					if (operator === "in") return undefined; // `in []` matches nothing.
					continue; // `out []` matches everything, so skip the filter.
				}
				filters.push({
					fieldFilter: { field: { fieldPath }, op: OPERATORS[operator], value: { arrayValue: { values: values.map(encode) } } },
				});
			} else filters.push({ fieldFilter: { field: { fieldPath }, op: OPERATORS[operator], value: encode(value) } });
		}
		const orders = getQueryOrders(query).map(({ key, direction }) => {
			const k = joinDataPath(key);
			return { field: { fieldPath: k === "id" ? "__name__" : k }, direction: direction === "asc" ? "ASCENDING" : "DESCENDING" };
		});
		if (orders.length) structured.orderBy = orders;
		const limit = getQueryLimit(query);
		if (typeof limit === "number") structured.limit = limit;
	}
	const [firstFilter] = filters;
	if (filters.length > 1) structured.where = { compositeFilter: { op: "AND", filters } };
	else if (firstFilter) structured.where = firstFilter;
	if (select) structured.select = { fields: [{ fieldPath: "__name__" }] };
	return structured;
}

/** Convert an `Updates` object to a Firestore REST `Write` against a document name. */
function _getUpdateWrite(name: string, updates: Updates<Data>, caller: AnyCaller): _FirestoreWrite {
	const fields: { [key: string]: FirestoreValue } = {};
	const fieldPaths: MutableArray<string> = [];
	const transforms: MutableArray<_FirestoreTransform> = [];
	for (const { key, action, value } of getUpdates(updates)) {
		const fieldPath = joinDataPath(key);
		if (action === "set") {
			_setDeepField(fields, key, toFirestoreValue(value, caller));
			fieldPaths.push(fieldPath);
		} else if (action === "sum") transforms.push({ fieldPath, increment: toFirestoreValue(value, caller) });
		else if (action === "with")
			transforms.push({ fieldPath, appendMissingElements: { values: value.map(v => toFirestoreValue(v, caller)) } });
		else if (action === "omit") transforms.push({ fieldPath, removeAllFromArray: { values: value.map(v => toFirestoreValue(v, caller)) } });
	}
	return {
		update: { name, fields },
		updateMask: { fieldPaths },
		...(transforms.length ? { updateTransforms: transforms } : {}),
		currentDocument: { exists: true },
	};
}

/** Set a value into nested Firestore fields at a deep key, creating intermediate maps. */
function _setDeepField(fields: { [key: string]: FirestoreValue }, segments: ImmutableArray<string>, value: FirestoreValue): void {
	const [first, ...rest] = segments as [string, ...string[]];
	if (!rest.length) {
		fields[first] = value;
		return;
	}
	const existing = fields[first]?.mapValue?.fields;
	const nested: { [key: string]: FirestoreValue } = existing ? { ...existing } : {};
	fields[first] = { mapValue: { fields: nested } };
	_setDeepField(nested, rest, value);
}

/** Options for `FirestoreProvider`. */
export interface FirestoreProviderOptions {
	/** Google Cloud project id. */
	readonly project: string;
	/**
	 * Firestore database id.
	 * @default "(default)"
	 */
	readonly database?: string | undefined;
	/**
	 * Base URL of the Firestore API, e.g. `"http://127.0.0.1:8080"` for the Firestore emulator.
	 * @default "https://firestore.googleapis.com"
	 */
	readonly host?: string | undefined;
	/**
	 * Return an OAuth2 access token for each request, e.g. from `google-auth-library` or a hand-rolled service-account JWT exchange.
	 * - Omit to send no `Authorization` header (correct for the Firestore emulator).
	 */
	readonly token?: (() => string | PromiseLike<string>) | undefined;
	/** Fetch implementation to use for requests (defaults to the global `fetch`). */
	readonly fetch?: ((input: string, init: RequestInit) => Promise<Response>) | undefined;
}

/**
 * Cloud Firestore database provider that talks to the Firestore REST API using `fetch`, implementing the `DBProvider` abstraction.
 *
 * - Zero dependencies, so it runs anywhere `fetch` runs: Node.js, Bun, Cloudflare Workers, Deno, and other edge runtimes.
 * - Supports transactions via `transact()` — reads see a consistent snapshot, writes buffer and commit atomically, and contended commits retry.
 * - Does not support realtime subscriptions: `getItemSequence()` and `getQuerySequence()` throw `UnsupportedError` (the `:listen` endpoint requires a streaming session the plain REST API cannot provide).
 * - Data read from Firestore is unvalidated — wrap in `ValidationDBProvider` to guarantee types.
 *
 * @example
 *  const provider = new FirestoreProvider({ project: "my-project", token: () => auth.getAccessToken() });
 *  const id = await provider.addItem(users, { name: "Dave" });
 *
 * @see https://shelving.cc/firebase/FirestoreProvider
 */
export class FirestoreProvider<I extends string = string, T extends Data = Data> extends DBProvider<I, T> {
	/** Options this provider was created with (shared with transaction providers). */
	protected readonly _options: FirestoreProviderOptions;

	/** Path of the documents root, `projects/{project}/databases/{database}/documents`. */
	protected readonly _root: string;

	/** Transaction id included as the consistency selector in reads (set only on transaction providers). */
	protected _transaction: string | undefined = undefined;

	constructor(options: FirestoreProviderOptions) {
		super();
		this._options = options;
		const { project, database = "(default)" } = options;
		this._root = `projects/${project}/databases/${database}/documents`;
	}

	/** Get the full Firestore document name for an item. */
	protected _getDocumentName(collection: Collection<string, I, Data>, id: string): string {
		return `${this._root}/${collection.name}/${id}`;
	}

	/** POST a request to a Firestore REST method on the documents root, e.g. `commit`, and return the parsed JSON response. */
	protected async _request(method: string, body: Data): Promise<unknown> {
		const { host = "https://firestore.googleapis.com", token, fetch: customFetch } = this._options;
		const headers: { [key: string]: string } = { "Content-Type": "application/json" };
		if (token) headers.Authorization = `Bearer ${await token()}`;
		const url = `${host}/v1/${this._root}:${method}`;
		const init = { method: "POST", headers, body: JSON.stringify(body) };
		const response = customFetch ? await customFetch(url, init) : await globalThis.fetch(url, init);
		const json: unknown = await response.json().catch(() => undefined);
		if (!response.ok) {
			const error = isPlainObject(json) && isPlainObject(json.error) ? json.error : undefined;
			throw new ResponseError(typeof error?.message === "string" ? error.message : `Firestore ${method} request failed`, {
				code: response.status,
				status: error?.status,
				provider: this,
			});
		}
		return json;
	}

	/** The consistency selector props included in read request bodies. */
	protected get _consistency(): Data {
		return this._transaction ? { transaction: this._transaction } : {};
	}

	/**
	 * Send a set of `Write` operations.
	 * - Committed immediately in batches of up to 500 (overridden by transaction providers to buffer until commit).
	 */
	protected async _write(writes: ImmutableArray<_FirestoreWrite>): Promise<void> {
		for (let i = 0; i < writes.length; i += WRITE_BATCH) await this._request("commit", { writes: writes.slice(i, i + WRITE_BATCH) });
	}

	/** Run a query returning only the matching document names. */
	protected async _getQueryNames<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>> | undefined,
		caller: AnyCaller,
	): Promise<ImmutableArray<string>> {
		const structuredQuery = _getStructuredQuery(this._root, collection.name, query, true, caller);
		if (!structuredQuery) return [];
		const results = (await this._request("runQuery", { structuredQuery, ...this._consistency })) as ImmutableArray<{
			document?: _FirestoreDocument;
		}>;
		return results.flatMap(r => (r.document ? [r.document.name] : []));
	}

	override async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		const results = (await this._request("batchGet", {
			documents: [this._getDocumentName(collection, id)],
			...this._consistency,
		})) as ImmutableArray<{ found?: _FirestoreDocument }>;
		const found = results[0]?.found;
		if (found) return _getItem<II, TT>(found, this.getItem);
	}

	/** Not supported — the REST API has no realtime listeners, so this throws `UnsupportedError`. */
	override getItemSequence<II extends I, TT extends T>(_collection: Collection<string, II, TT>, _id: II): OptionalItemSequence<II, TT> {
		throw new UnsupportedError("FirestoreProvider does not support realtime subscriptions");
	}

	/** Generates a random 20-character id for the new item (fails if the id already exists). */
	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		const id = getRandomKey(20) as II; // `as II` needed: generated keys are always plain strings.
		await this._write([
			{
				update: { name: this._getDocumentName(collection, id), fields: toFirestoreFields(data, this.addItem) },
				currentDocument: { exists: false },
			},
		]);
		return id;
	}

	override async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await this._write([{ update: { name: this._getDocumentName(collection, id), fields: toFirestoreFields(data, this.setItem) } }]);
	}

	/** Fails if the item does not exist. */
	override async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		await this._write([_getUpdateWrite(this._getDocumentName(collection, id), updates, this.updateItem)]);
	}

	override async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		await this._write([{ delete: this._getDocumentName(collection, id) }]);
	}

	override async countQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<number> {
		const structuredQuery = _getStructuredQuery(this._root, collection.name, query, false, this.countQuery);
		if (!structuredQuery) return 0;
		const results = (await this._request("runAggregationQuery", {
			structuredAggregationQuery: { structuredQuery, aggregations: [{ alias: "count", count: {} }] },
			...this._consistency,
		})) as ImmutableArray<{ result?: { aggregateFields?: { count?: FirestoreValue } } }>;
		const count = results[0]?.result?.aggregateFields?.count;
		return count ? Number(toData({ count }, this.countQuery).count) : 0;
	}

	override async getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		const structuredQuery = _getStructuredQuery(this._root, collection.name, query, false, this.getQuery);
		if (!structuredQuery) return [];
		const results = (await this._request("runQuery", { structuredQuery, ...this._consistency })) as ImmutableArray<{
			document?: _FirestoreDocument;
		}>;
		return results.flatMap(r => (r.document ? [_getItem<II, TT>(r.document, this.getQuery)] : []));
	}

	/** Not supported — the REST API has no realtime listeners, so this throws `UnsupportedError`. */
	override getQuerySequence<II extends I, TT extends T>(
		_collection: Collection<string, II, TT>,
		_query?: Query<Item<II, TT>>,
	): ItemsSequence<II, TT> {
		throw new UnsupportedError("FirestoreProvider does not support realtime subscriptions");
	}

	override async setQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		data: TT,
	): Promise<void> {
		const names = await this._getQueryNames(collection, query, this.setQuery);
		const fields = toFirestoreFields(data, this.setQuery);
		await this._write(names.map(name => ({ update: { name, fields } })));
	}

	override async updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		const names = await this._getQueryNames(collection, query, this.updateQuery);
		await this._write(names.map(name => _getUpdateWrite(name, updates, this.updateQuery)));
	}

	override async deleteQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
	): Promise<void> {
		const names = await this._getQueryNames(collection, query, this.deleteQuery);
		await this._write(names.map(name => ({ delete: name })));
	}

	/**
	 * Runs the callback in a Firestore transaction: begin → reads with the transaction id → buffered writes committed atomically.
	 * - Retries the whole callback (up to 5 attempts) when the commit is aborted by contention, so the callback must have no side effects other than through its provider.
	 * - Rolls back and rethrows if the callback throws.
	 * - Reads see a consistent snapshot and never the transaction's own buffered writes.
	 */
	override async transact<X>(callback: (provider: DBProvider<I, T>) => Promise<X>): Promise<X> {
		let retryTransaction: string | undefined;
		let aborted: unknown;
		for (let attempt = 0; attempt < TRANSACTION_ATTEMPTS; attempt++) {
			const { transaction } = (await this._request("beginTransaction", {
				options: { readWrite: retryTransaction ? { retryTransaction } : {} },
			})) as { transaction: string };
			const provider = new _FirestoreTransaction<I, T>(this._options, transaction);
			let result: X;
			try {
				result = await callback(provider);
			} catch (thrown) {
				await this._request("rollback", { transaction }).catch(BLACKHOLE);
				throw thrown;
			}
			try {
				await this._request("commit", { transaction, writes: provider.writes });
				return result;
			} catch (thrown) {
				if (!(thrown instanceof ResponseError) || thrown.status !== "ABORTED") throw thrown;
				retryTransaction = transaction; // Retry the transaction after contention.
				aborted = thrown;
			}
		}
		throw aborted;
	}
}

/** Transaction-scoped provider for `FirestoreProvider.transact()` — reads carry the transaction id, writes buffer until commit. */
class _FirestoreTransaction<I extends string, T extends Data> extends FirestoreProvider<I, T> {
	/** The buffered `Write` operations, sent in the transaction's final commit. */
	readonly writes: MutableArray<_FirestoreWrite> = [];

	constructor(options: FirestoreProviderOptions, transaction: string) {
		super(options);
		this._transaction = transaction;
	}

	/** Buffer the writes until the transaction commits. */
	protected override async _write(writes: ImmutableArray<_FirestoreWrite>): Promise<void> {
		this.writes.push(...writes);
	}

	/** Not supported inside a transaction — always throws `UnsupportedError`. */
	override transact<X>(_callback: (provider: DBProvider<I, T>) => Promise<X>): Promise<X> {
		throw new UnsupportedError("FirestoreProvider does not support nested transactions");
	}
}

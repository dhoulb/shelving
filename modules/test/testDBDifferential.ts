import { expect, test } from "bun:test";
import type { Collection } from "../db/collection/Collection.js";
import type { DBProvider } from "../db/provider/DBProvider.js";
import { MemoryDBProvider } from "../db/provider/MemoryDBProvider.js";
import type { Data } from "../util/data.js";
import type { Items } from "../util/item.js";
import type { Query } from "../util/query.js";
import type { Updates } from "../util/update.js";
import { BASICS_COLLECTION, type BasicData } from "./basics.js";

/** Options for `testDBDifferential()`. */
export interface TestDBDifferentialOptions {
	/** Number of random sequences to run. Each sequence uses its own seed, so a failure names a seed you can run again. @default 25 */
	readonly runs?: number;
	/** Number of random operations in each sequence. @default 40 */
	readonly length?: number;
	/** First seed. @default 1 */
	readonly seed?: number;
	/** Whether the operations use nested keys like `sub.num` in filters, orders and updates. @default true */
	readonly nested?: boolean;
	/** Whether to compare `tags` arrays as sets, for backends that do not keep array order in `with` / `omit` updates (e.g. SQL). @default false */
	readonly unorderedArrays?: boolean;
	/** Get more state from the provider to compare with the reference after each operation, e.g. a copy of the provider made from its backing store. */
	readonly check?: (provider: DBProvider<string, Data>) => Promise<Items<string, Data>>;
	/** Wrap each operation, e.g. to run it inside a transaction with `(provider, callback) => provider.transact(callback)`. */
	readonly wrap?: (
		provider: DBProvider<string, Data>,
		callback: (provider: DBProvider<string, Data>) => Promise<unknown>,
	) => Promise<unknown>;
}

/** A random operation that `testDBDifferential()` runs on the reference and on the provider under test. */
export type DBDifferentialOperation =
	| { readonly action: "set"; readonly id: string; readonly data: BasicData }
	| { readonly action: "update"; readonly id: string; readonly updates: Updates }
	| { readonly action: "delete"; readonly id: string }
	| { readonly action: "setQuery"; readonly query: Query; readonly data: BasicData }
	| { readonly action: "updateQuery"; readonly query: Query; readonly updates: Updates }
	| { readonly action: "deleteQuery"; readonly query: Query }
	| { readonly action: "get"; readonly id: string }
	| { readonly action: "getQuery"; readonly query: Query }
	| { readonly action: "countQuery"; readonly query: Query };

/**
 * Register a differential test that runs the same random operations against a provider and against a reference `MemoryDBProvider`, and fails at the first difference.
 *
 * - After each operation it compares the result, any error, and the full contents of `BASICS_COLLECTION`.
 * - Operations use a small set of ids and values, so they often touch the same items and match the same queries.
 * - Every `$order` ends with `id`, so the order is total and the same in every backend.
 * - A failure message names the seed, the operation, and every operation before it, so you can reproduce it.
 *
 * @param name Name for the provider, used in the test name.
 * @param createProvider Create (or return) the provider to test. The test wipes `BASICS_COLLECTION` before each sequence.
 * @param options Options for the test.
 * @example testDBDifferential("ValidationDBProvider", () => new ValidationDBProvider(new MemoryDBProvider<string>()));
 * @see https://shelving.cc/test/testDBDifferential
 */
export function testDBDifferential(
	name: string,
	createProvider: () => DBProvider<string, Data> | PromiseLike<DBProvider<string, Data>>,
	{
		runs = 25,
		length = 40,
		seed = 1,
		nested = true,
		unorderedArrays = false,
		check,
		wrap = (provider, callback) => callback(provider),
	}: TestDBDifferentialOptions = {},
): void {
	test(`DBProvider differential: ${name}`, async () => {
		const toJSON = (value: unknown) => JSON.stringify(_normalize(value, unorderedArrays));
		for (let s = seed; s < seed + runs; s++) {
			const random = _getRandom(s);
			const reference = new MemoryDBProvider<string>();
			const provider = await createProvider();
			await provider.deleteQuery(BASICS_COLLECTION, {});
			const operations: DBDifferentialOperation[] = [];
			for (let i = 0; i < length; i++) {
				const operation = _getOperation(random, nested);
				operations.push(operation);
				const want = await _settle(() => _runOperation(reference, operation));
				const got = await _settle(() => wrap(provider, p => _runOperation(p, operation)));
				const wantItems = await reference.getQuery(BASICS_COLLECTION, { $order: "id" });
				const message = `seed ${s}, operation ${i}: ${JSON.stringify(operation)}\nAll operations: ${JSON.stringify(operations)}`;
				expect(toJSON(got), `Result differs at ${message}`).toBe(toJSON(want));
				expect(toJSON(await provider.getQuery(BASICS_COLLECTION, { $order: "id" })), `State differs at ${message}`).toBe(toJSON(wantItems));
				if (check)
					expect(toJSON((await check(provider)).toSorted((a, b) => (a.id < b.id ? -1 : 1))), `Checked state differs at ${message}`).toBe(
						toJSON(wantItems),
					);
			}
		}
	});
}

/** Run an operation, and sort an unordered query result by id so results compare. */
async function _runOperation(provider: DBProvider<string, Data>, operation: DBDifferentialOperation): Promise<unknown> {
	const collection = BASICS_COLLECTION as unknown as Collection<string, string, Data>; // `as` needed: the fixture collection is narrower than the provider's.
	switch (operation.action) {
		case "set":
			return provider.setItem(collection, operation.id, operation.data);
		case "update":
			return provider.updateItem(collection, operation.id, operation.updates);
		case "delete":
			return provider.deleteItem(collection, operation.id);
		case "setQuery":
			return provider.setQuery(collection, operation.query, operation.data);
		case "updateQuery":
			return provider.updateQuery(collection, operation.query, operation.updates);
		case "deleteQuery":
			return provider.deleteQuery(collection, operation.query);
		case "get":
			return provider.getItem(collection, operation.id);
		case "getQuery": {
			const items = await provider.getQuery(collection, operation.query);
			return operation.query.$order ? items : items.toSorted((a, b) => (a.id < b.id ? -1 : 1));
		}
		case "countQuery":
			return provider.countQuery(collection, operation.query);
	}
}

/** Run an operation and return its result, or the name of the error it throws, so errors compare too. */
async function _settle(callback: () => Promise<unknown>): Promise<unknown> {
	try {
		return { result: await callback() };
	} catch (thrown) {
		return { error: thrown instanceof Error ? thrown.name : String(thrown) };
	}
}

/** Sort object keys and drop `undefined` and `null` props, so items from different backends compare. */
function _normalize(value: unknown, unorderedArrays: boolean, key?: string): unknown {
	if (Array.isArray(value)) {
		const items = value.map(v => _normalize(v, unorderedArrays));
		return unorderedArrays && key === "tags" ? items.toSorted() : items;
	}
	if (value && typeof value === "object") {
		const output: Record<string, unknown> = {};
		for (const k of Object.keys(value).sort()) {
			const v = (value as Record<string, unknown>)[k];
			if (v !== undefined && v !== null) output[k] = _normalize(v, unorderedArrays, k);
		}
		return output;
	}
	return value;
}

// Small value sets, so operations often touch the same items and match the same queries.
const _IDS = ["a", "b", "c", "d", "e", "f"];
const _STRS = ["aa", "ab", "b", "ba", "c", "z"];
const _NUMS = [-1, 0, 1, 2, 2.5, 3, 10];
const _GROUPS = ["a", "b", "c"] as const;
const _TAGS = ["x", "y", "z"];

type _Random = () => number;

/** Get a seeded random number generator (mulberry32), so every sequence can run again. */
function _getRandom(seed: number): _Random {
	let state = seed;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function _pick<T>(random: _Random, items: readonly T[]): T {
	return items[Math.floor(random() * items.length)] as T;
}

function _getTags(random: _Random): string[] {
	return _TAGS.filter(() => random() < 0.5);
}

function _getData(random: _Random): BasicData {
	return {
		str: _pick(random, _STRS),
		num: _pick(random, _NUMS),
		group: _pick(random, _GROUPS),
		tags: _getTags(random),
		odd: random() < 0.5,
		even: random() < 0.5,
		sub: { str: _pick(random, _STRS), num: _pick(random, _NUMS), odd: random() < 0.5, even: random() < 0.5 },
	};
}

function _getUpdates(random: _Random, nested: boolean): Updates {
	// Each update writes a different column, because SQL can not write one column twice in one statement.
	const choices: (() => [string, unknown])[] = [
		() => ["str", _pick(random, _STRS)],
		() => [_pick(random, ["=num", "+=num", "-=num"]), _pick(random, [1, 2, 5])],
		() => [_pick(random, ["+[]tags", "-[]tags"]), random() < 0.5 ? _pick(random, _TAGS) : _getTags(random)],
		() => ["group", _pick(random, _GROUPS)],
		() => ["odd", random() < 0.5],
	];
	if (nested) choices.push(() => [_pick(random, ["=sub.num", "+=sub.num"]), _pick(random, _NUMS)]);
	const updates: Record<string, unknown> = {};
	const count = 1 + Math.floor(random() * 3);
	for (let i = 0; i < count; i++) {
		const [key, value] = _pick(random, choices)();
		const column = _getColumn(key);
		if (!Object.keys(updates).some(k => _getColumn(k) === column)) updates[key] = value;
	}
	return updates as Updates; // `as` needed: the keys are built at runtime.
}

/** Get the column an update key writes, e.g. `sub` for `+=sub.num`. */
function _getColumn(key: string): string {
	return key.replace(/^[=+\-[\]]+/, "").split(".")[0] ?? key;
}

function _getQuery(random: _Random, nested: boolean): Query {
	const query: Record<string, unknown> = {};
	const choices = [
		() => (query.num = _pick(random, _NUMS)),
		() => (query["!num"] = _pick(random, _NUMS)),
		() => (query.num = [_pick(random, _NUMS), _pick(random, _NUMS)]),
		() => (query["!group"] = [_pick(random, _GROUPS)]),
		() => (query[_pick(random, ["num>", "num>=", "num<", "num<="])] = _pick(random, _NUMS)),
		() => (query["str>="] = _pick(random, _STRS)),
		() => (query["tags[]"] = _pick(random, _TAGS)),
		() => (query.odd = random() < 0.5),
		() => (query.group = _pick(random, _GROUPS)),
		() => (query.id = _pick(random, _IDS)),
		() => nested && (query[_pick(random, ["sub.num>", "sub.num<="])] = _pick(random, _NUMS)),
		() => nested && (query["sub.str"] = _pick(random, _STRS)),
	];
	const count = Math.floor(random() * 3);
	for (let i = 0; i < count; i++) _pick(random, choices)();
	const orders = nested ? ["num", "!num", "str", "!str", "group", "sub.num", "!sub.num"] : ["num", "!num", "str", "!str", "group"];
	if (random() < 0.6) {
		query.$order = [_pick(random, orders), "id"]; // End with `id`, so the order is total.
		if (random() < 0.5) query.$limit = 1 + Math.floor(random() * 4);
	}
	return query as Query; // `as` needed: the keys are built at runtime.
}

function _getOperation(random: _Random, nested: boolean): DBDifferentialOperation {
	const r = random();
	const id = _pick(random, _IDS);
	if (r < 0.25) return { action: "set", id, data: _getData(random) };
	if (r < 0.45) return { action: "update", id, updates: _getUpdates(random, nested) };
	if (r < 0.52) return { action: "delete", id };
	if (r < 0.57) return { action: "setQuery", query: _getQuery(random, nested), data: _getData(random) };
	if (r < 0.64) return { action: "updateQuery", query: _getQuery(random, nested), updates: _getUpdates(random, nested) };
	if (r < 0.67) return { action: "deleteQuery", query: _getQuery(random, nested) };
	if (r < 0.75) return { action: "get", id };
	if (r < 0.92) return { action: "getQuery", query: _getQuery(random, nested) };
	return { action: "countQuery", query: _getQuery(random, nested) };
}

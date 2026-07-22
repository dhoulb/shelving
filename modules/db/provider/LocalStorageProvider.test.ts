import { expect, test } from "bun:test";
import { LocalStorageProvider, type LocalStorageTable } from "shelving/db";
import { UnsupportedError } from "shelving/error";
import { runMicrotasks } from "shelving/util/async";
import type { Item, OptionalItem } from "shelving/util/item";
import { runSequence } from "shelving/util/sequence";
import {
	BASICS_COLLECTION,
	type BasicData,
	basic1,
	basic2,
	basic3,
	basic4,
	basic9,
	basics,
	expectUnorderedItems,
} from "../../test/index.js";

/** Minimal in-memory `Storage` for tests (Bun has no `localStorage`). */
function createStorage(map = new Map<string, string>()): Storage {
	return {
		get length() {
			return map.size;
		},
		key: (index: number) => [...map.keys()][index] ?? null,
		getItem: (key: string) => map.get(key) ?? null,
		setItem: (key: string, value: string) => void map.set(key, String(value)),
		removeItem: (key: string) => void map.delete(key),
		clear: () => map.clear(),
	} as Storage;
}

test("LocalStorageProvider: writes persist to storage and reads come from memory", async () => {
	const map = new Map<string, string>();
	const db = new LocalStorageProvider<string>({ prefix: "test:", storage: createStorage(map) });
	expect(db.persistent).toBe(true);

	// Set persists the full item as JSON under a prefixed key.
	await db.setItem(BASICS_COLLECTION, "basic1", basic1);
	expect(JSON.parse(map.get("test:basics:basic1") as string)).toEqual(basic1);
	expect(await db.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);

	// Add generates an id and persists.
	const { id: _basic9Id, ...basic9Data } = basic9;
	const addedId = await db.addItem(BASICS_COLLECTION, basic9Data);
	expect(typeof addedId).toBe("string");
	expect(map.has(`test:basics:${addedId}`)).toBe(true);

	// Update persists the merged item.
	await db.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW" });
	expect(JSON.parse(map.get("test:basics:basic1") as string)).toMatchObject({ ...basic1, str: "NEW" });

	// Delete removes the key.
	await db.deleteItem(BASICS_COLLECTION, "basic1");
	expect(map.has("test:basics:basic1")).toBe(false);
	expect<Item<string, BasicData> | undefined>(await db.getItem(BASICS_COLLECTION, "basic1")).toBe(undefined);
});

test("LocalStorageProvider: hydrates a collection from pre-existing storage", async () => {
	const map = new Map<string, string>();
	for (const item of basics) map.set(`test:basics:${item.id}`, JSON.stringify(item));
	map.set("other:unrelated", "not ours"); // Foreign keys are ignored.
	map.set("test:basics:garbage", "{malformed json"); // Malformed values are skipped.

	const db = new LocalStorageProvider<string>({ prefix: "test:", storage: createStorage(map) });
	expect(await db.getQuery(BASICS_COLLECTION, {})).toEqual(basics);
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { group: "a" }), ["basic1", "basic2", "basic3"]);
	expect(await db.getItem(BASICS_COLLECTION, "basic2")).toMatchObject(basic2);
});

test("LocalStorageProvider: query writes persist per item", async () => {
	const map = new Map<string, string>();
	const db = new LocalStorageProvider<string>({ prefix: "test:", storage: createStorage(map) });
	for (const { id, ...data } of basics) await db.setItem(BASICS_COLLECTION, id, data);

	await db.updateQuery(BASICS_COLLECTION, { group: "a" }, { str: "GROUPED" });
	expect(JSON.parse(map.get("test:basics:basic1") as string)).toMatchObject({ ...basic1, str: "GROUPED" });
	expect(JSON.parse(map.get("test:basics:basic4") as string)).toMatchObject(basic4);

	await db.deleteQuery(BASICS_COLLECTION, { group: "a" });
	expect(map.has("test:basics:basic1")).toBe(false);
	expect(map.has("test:basics:basic4")).toBe(true);
	expect(await db.countQuery(BASICS_COLLECTION, {})).toBe(6);
});

test("LocalStorageProvider: a failed storage write throws and leaves memory unchanged", async () => {
	const map = new Map<string, string>();
	const storage = createStorage(map);
	let full = false;
	const setItem = storage.setItem.bind(storage);
	storage.setItem = (key: string, value: string) => {
		if (full) throw new Error("QuotaExceededError");
		setItem(key, value);
	};

	const db = new LocalStorageProvider<string>({ prefix: "test:", storage });
	await db.setItem(BASICS_COLLECTION, "basic1", basic1);

	full = true;
	await expect(db.setItem(BASICS_COLLECTION, "basic2", basic2)).rejects.toThrow("QuotaExceededError");
	await expect(db.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW" })).rejects.toThrow("QuotaExceededError");

	// Nothing changed in memory or storage.
	expect<Item<string, BasicData> | undefined>(await db.getItem(BASICS_COLLECTION, "basic2")).toBe(undefined);
	expect(await db.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);
	expect(map.has("test:basics:basic2")).toBe(false);

	// Deletes still work when storage is full.
	await db.deleteItem(BASICS_COLLECTION, "basic1");
	expect(map.has("test:basics:basic1")).toBe(false);
});

test("LocalStorageProvider: unusable storage degrades to memory-only", async () => {
	const storage = createStorage();
	storage.setItem = () => {
		throw new Error("QuotaExceededError"); // e.g. private browsing with zero quota — the probe write fails.
	};

	const db = new LocalStorageProvider<string>({ prefix: "test:", storage });
	expect(db.persistent).toBe(false);

	// The provider still works, purely in memory.
	await db.setItem(BASICS_COLLECTION, "basic1", basic1);
	expect(await db.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);
	expect(storage.length).toBe(0);
});

test.skipIf("localStorage" in globalThis)("LocalStorageProvider: throws UnsupportedError where localStorage doesn't exist", () => {
	expect(() => new LocalStorageProvider()).toThrow(UnsupportedError);
});

test("LocalStorageProvider: syncs changes made in another tab into memory and sequences", async () => {
	const map = new Map<string, string>();
	const storage = createStorage(map);

	// Two providers over the same storage simulate two tabs.
	const tabA = new LocalStorageProvider<string>({ prefix: "test:", storage });
	const tabB = new LocalStorageProvider<string>({ prefix: "test:", storage });
	const tableA = tabA.getTable(BASICS_COLLECTION) as LocalStorageTable<string, BasicData>;

	// Subscribe in tab A.
	const calls: OptionalItem<string, BasicData>[] = [];
	const stop = runSequence(tabA.getItemSequence(BASICS_COLLECTION, "basic1"), v => void calls.push(v));
	await runMicrotasks();
	expect(calls.length).toBe(1);

	// Tab B writes; the browser would fire a `storage` event in tab A — deliver it to the table directly.
	await tabB.setItem(BASICS_COLLECTION, "basic1", basic1);
	tableA.sync("test:basics:basic1", map.get("test:basics:basic1") ?? null);
	await runMicrotasks();
	expect(calls.length).toBe(2);
	expect(calls[1]).toMatchObject(basic1);
	expect(await tabA.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);

	// Tab B deletes.
	await tabB.deleteItem(BASICS_COLLECTION, "basic1");
	tableA.sync("test:basics:basic1", null);
	await runMicrotasks();
	expect(calls.length).toBe(3);
	expect<Item<string, BasicData> | undefined>(calls[2]).toBe(undefined);

	// Another tab clears storage entirely.
	await tabB.setItem(BASICS_COLLECTION, "basic3", basic3);
	tableA.sync("test:basics:basic3", map.get("test:basics:basic3") ?? null);
	storage.clear();
	tableA.syncClear();
	expect(await tabA.countQuery(BASICS_COLLECTION, {})).toBe(0);

	stop();
});

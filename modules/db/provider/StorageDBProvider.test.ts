import { expect, test } from "bun:test";
import { StorageDBProvider } from "shelving/db";
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

/** Fire a `storage` event on the global scope, as the browser would after another tab changed `storageArea`. */
function dispatchStorage(storageArea: Storage, key: string | null, newValue: string | null): void {
	globalThis.dispatchEvent(Object.assign(new Event("storage"), { storageArea, key, newValue }));
}

test("StorageDBProvider: writes persist to storage and reads come from memory", async () => {
	const map = new Map<string, string>();
	await using db = new StorageDBProvider<string>(createStorage(map), "test:");
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

test("StorageDBProvider: hydrates a collection from pre-existing storage", async () => {
	const map = new Map<string, string>();
	for (const item of basics) map.set(`test:basics:${item.id}`, JSON.stringify(item));
	map.set("other:unrelated", "not ours"); // Foreign keys are ignored.
	map.set("test:basics:garbage", "{malformed json"); // Malformed values are skipped.
	map.set("test:basics:basic1", JSON.stringify({ ...basic1, id: "WRONG" })); // The id in the key is authoritative, not the one in the JSON.

	await using db = new StorageDBProvider<string>(createStorage(map), "test:");
	expect(await db.getQuery(BASICS_COLLECTION, {})).toEqual(basics);
	expectUnorderedItems(await db.getQuery(BASICS_COLLECTION, { group: "a" }), ["basic1", "basic2", "basic3"]);
	expect(await db.getItem(BASICS_COLLECTION, "basic2")).toMatchObject(basic2);
});

test("StorageDBProvider: query writes persist per item", async () => {
	const map = new Map<string, string>();
	await using db = new StorageDBProvider<string>(createStorage(map), "test:");
	for (const { id, ...data } of basics) await db.setItem(BASICS_COLLECTION, id, data);

	await db.updateQuery(BASICS_COLLECTION, { group: "a" }, { str: "GROUPED" });
	expect(JSON.parse(map.get("test:basics:basic1") as string)).toMatchObject({ ...basic1, str: "GROUPED" });
	expect(JSON.parse(map.get("test:basics:basic4") as string)).toMatchObject(basic4);

	await db.deleteQuery(BASICS_COLLECTION, { group: "a" });
	expect(map.has("test:basics:basic1")).toBe(false);
	expect(map.has("test:basics:basic4")).toBe(true);
	expect(await db.countQuery(BASICS_COLLECTION, {})).toBe(6);
});

test("StorageDBProvider: a failed storage write throws and leaves memory unchanged", async () => {
	const map = new Map<string, string>();
	const storage = createStorage(map);
	let full = false;
	const setItem = storage.setItem.bind(storage);
	storage.setItem = (key: string, value: string) => {
		if (full) throw new Error("QuotaExceededError");
		setItem(key, value);
	};

	await using db = new StorageDBProvider<string>(storage, "test:");
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

test("StorageDBProvider: unusable storage degrades to memory-only", async () => {
	const storage = createStorage();
	storage.setItem = () => {
		throw new Error("QuotaExceededError"); // e.g. private browsing with zero quota — the probe write fails.
	};

	await using db = new StorageDBProvider<string>(storage, "test:");
	expect(db.persistent).toBe(false);

	// The provider still works, purely in memory.
	await db.setItem(BASICS_COLLECTION, "basic1", basic1);
	expect(await db.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);
	expect(storage.length).toBe(0);
});

test("StorageDBProvider: throws UnsupportedError when no storage is given", () => {
	expect(() => new StorageDBProvider(undefined as unknown as Storage)).toThrow(UnsupportedError); // `as` needed: simulates a plain-JS caller passing nothing.
});

test("StorageDBProvider: syncs changes made in another tab into memory and sequences", async () => {
	const map = new Map<string, string>();
	const storage = createStorage(map);
	await using db = new StorageDBProvider<string>(storage, "test:");

	// Subscribe.
	const calls: OptionalItem<string, BasicData>[] = [];
	const stop = runSequence(db.getItemSequence(BASICS_COLLECTION, "basic1"), v => void calls.push(v));
	await runMicrotasks();
	expect(calls.length).toBe(1);

	// Another tab sets an item: the value appears in storage, then the browser fires a `storage` event here.
	map.set("test:basics:basic1", JSON.stringify(basic1));
	dispatchStorage(storage, "test:basics:basic1", map.get("test:basics:basic1") ?? null);
	await runMicrotasks();
	expect(calls.length).toBe(2);
	expect(calls[1]).toMatchObject(basic1);
	expect(await db.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);

	// Another tab deletes the item.
	map.delete("test:basics:basic1");
	dispatchStorage(storage, "test:basics:basic1", null);
	await runMicrotasks();
	expect(calls.length).toBe(3);
	expect<Item<string, BasicData> | undefined>(calls[2]).toBe(undefined);

	// Events for other storages and foreign keys are ignored.
	dispatchStorage(createStorage(), "test:basics:basic1", JSON.stringify(basic2));
	dispatchStorage(storage, "other:unrelated", "not ours");
	await runMicrotasks();
	expect(calls.length).toBe(3);

	// Another tab clears the storage entirely.
	await db.setItem(BASICS_COLLECTION, "basic3", basic3);
	map.clear();
	dispatchStorage(storage, null, null);
	expect(await db.countQuery(BASICS_COLLECTION, {})).toBe(0);

	stop();
});

test("StorageDBProvider: disposal removes the storage event listener", async () => {
	const map = new Map<string, string>();
	const storage = createStorage(map);
	const db = new StorageDBProvider<string>(storage, "test:");
	await db.setItem(BASICS_COLLECTION, "basic1", basic1);
	await db[Symbol.asyncDispose]();

	// Events after disposal are no longer applied.
	map.set("test:basics:basic2", JSON.stringify(basic2));
	dispatchStorage(storage, "test:basics:basic2", map.get("test:basics:basic2") ?? null);
	expect<Item<string, BasicData> | undefined>(await db.getItem(BASICS_COLLECTION, "basic2")).toBe(undefined);
});

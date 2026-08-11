import { describe, expect, test } from "bun:test";
import { MemoryDBProvider, UndoDBProvider } from "shelving/db";
import { BASICS_COLLECTION, basic1, basic2, basic3, basic999 } from "../../test/index.js";

describe("UndoDBProvider", () => {
	test("undo() restores the provider to the state before the recording", async () => {
		const memory = new MemoryDBProvider();
		await memory.setItem(BASICS_COLLECTION, "basic1", basic1);
		await memory.setItem(BASICS_COLLECTION, "basic2", basic2);
		const before = await memory.getQuery(BASICS_COLLECTION, { $order: "id" });

		const provider = new UndoDBProvider(memory);
		const id = await provider.addItem(BASICS_COLLECTION, basic999); // Added.
		await provider.setItem(BASICS_COLLECTION, "basic3", basic3); // Set an item that didn't exist.
		await provider.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW", "+=num": 1 }); // Updated an existing item.
		await provider.deleteItem(BASICS_COLLECTION, "basic2"); // Deleted an existing item.
		expect(await memory.getItem(BASICS_COLLECTION, id)).toMatchObject(basic999); // Changes applied immediately.
		expect(await memory.getItem(BASICS_COLLECTION, "basic2")).toBe(undefined);

		await provider.undo();
		expect(await memory.getQuery(BASICS_COLLECTION, { $order: "id" })).toEqual(before); // Everything back to how it was.
	});

	test("reads before a write are skipped when the log already establishes the item", async () => {
		const memory = new MemoryDBProvider();
		await memory.setItem(BASICS_COLLECTION, "basic1", basic1);
		const provider = new UndoDBProvider(memory);

		await provider.getItem(BASICS_COLLECTION, "basic1"); // Establishes basic1…
		await provider.setItem(BASICS_COLLECTION, "basic1", basic999); // …so this forces no extra read…
		await provider.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW" }); // …and neither does this.
		expect(provider.reads).toHaveLength(1);

		await provider.deleteItem(BASICS_COLLECTION, "basic2"); // Unestablished, so this reads first (observing absence).
		expect(provider.reads).toHaveLength(2);
	});

	test("query results establish items for later writes", async () => {
		const memory = new MemoryDBProvider();
		await memory.setItem(BASICS_COLLECTION, "basic1", basic1);
		const provider = new UndoDBProvider(memory);

		await provider.getQuery(BASICS_COLLECTION, { group: "a" }); // Establishes basic1 via the query result.
		await provider.deleteItem(BASICS_COLLECTION, "basic1"); // No extra read needed.
		expect(provider.reads).toHaveLength(1);

		await provider.undo();
		expect(await memory.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);
	});

	test("undo() restores the earliest observed state of an item written multiple times", async () => {
		const memory = new MemoryDBProvider();
		await memory.setItem(BASICS_COLLECTION, "basic1", basic1);
		const provider = new UndoDBProvider(memory);

		await provider.setItem(BASICS_COLLECTION, "basic1", basic999);
		await provider.getItem(BASICS_COLLECTION, "basic1"); // A later read observes the written value…
		await provider.deleteItem(BASICS_COLLECTION, "basic1");

		await provider.undo();
		expect(await memory.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1); // …but the earliest observation wins.
	});

	test("undo() does not record its own operations", async () => {
		const memory = new MemoryDBProvider();
		const provider = new UndoDBProvider(memory);
		await provider.setItem(BASICS_COLLECTION, "basic1", basic1);
		const length = provider.operations.length;

		await provider.undo();
		expect(provider.operations).toHaveLength(length); // The log still describes the original operations.
		expect(await memory.getItem(BASICS_COLLECTION, "basic1")).toBe(undefined); // The set was undone (it observed absence first).
	});
});

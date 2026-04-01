import { describe, expect, test } from "bun:test";
import { ChangesDBProvider, MockDBProvider } from "../../index.js";
import { BASICS_COLLECTION, basic1, basic999 } from "../../test/index.js";

describe("ChangesDBProvider", () => {
	test("records addItem() with an add action", async () => {
		const provider = new ChangesDBProvider(new MockDBProvider<string>());
		const id = await provider.addItem(BASICS_COLLECTION, basic999);

		expect(provider.changes).toEqual([{ action: "add", collection: "basics", id, data: basic999 }]);
	});

	test("records subsequent write operations in order", async () => {
		const provider = new ChangesDBProvider(new MockDBProvider<string>());

		await provider.setItem(BASICS_COLLECTION, "basic1", basic1);
		await provider.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW" });
		await provider.deleteQuery(BASICS_COLLECTION, { id: ["basic1"] });

		expect(provider.changes.slice(-3)).toEqual([
			{ action: "set", collection: "basics", id: "basic1", data: basic1 },
			{ action: "update", collection: "basics", id: "basic1", updates: { str: "NEW" } },
			{ action: "delete", collection: "basics", query: { id: ["basic1"] } },
		]);
	});
});

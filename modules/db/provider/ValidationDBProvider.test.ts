import { describe, expect, test } from "bun:test";
import { MemoryDBProvider, MockDBProvider, ValidationDBProvider } from "shelving/db";
import { ValueError } from "shelving/error";
import { BASICS_COLLECTION, basic1, basic2, basic999, TransactionTestDBProvider, testDBProvider } from "../../test/index.js";

// Every query and update in the contract suite must pass the full validators.
testDBProvider("ValidationDBProvider", () => new ValidationDBProvider(new MemoryDBProvider<string>()), {
	transactions: true,
	nestedTransactions: true,
});

describe("ValidationDBProvider", () => {
	test("rejects invalid items returned by the source provider", async () => {
		const source = new MockDBProvider();
		source.getTable(BASICS_COLLECTION).setItem("basic1", { ...basic1, num: "bad" } as never);
		const provider = new ValidationDBProvider(source);

		await expect(provider.getItem(BASICS_COLLECTION, "basic1")).rejects.toBeInstanceOf(ValueError);
	});

	test("rejects invalid items returned via derived reads", async () => {
		const source = new MockDBProvider();
		source.getTable(BASICS_COLLECTION).setItem("basic1", { ...basic1, num: "bad" } as never);
		const provider = new ValidationDBProvider(source);

		// Derived reads route through the wrapper's getItem()/getQuery(), so they validate too.
		await expect(provider.requireItem(BASICS_COLLECTION, "basic1")).rejects.toBeInstanceOf(ValueError);
		await expect(provider.getFirst(BASICS_COLLECTION, {})).rejects.toBeInstanceOf(ValueError);
		await expect(provider.requireFirst(BASICS_COLLECTION, {})).rejects.toBeInstanceOf(ValueError);
	});

	test("rejects invalid query results returned by the source provider", async () => {
		const source = new MockDBProvider();
		source.getTable(BASICS_COLLECTION).setItem("basic1", basic1);
		source.getTable(BASICS_COLLECTION).setItem("basic2", { ...basic2, num: "bad" } as never);
		const provider = new ValidationDBProvider(source);

		try {
			await provider.getQuery(BASICS_COLLECTION, {});
			expect.unreachable();
		} catch (thrown) {
			expect(thrown).toBeInstanceOf(ValueError);
			expect((thrown as Error).message).toContain("basic2");
		}
	});

	test("validates addItem() data before calling the source provider", async () => {
		const source = new MockDBProvider();
		const provider = new ValidationDBProvider(source);

		try {
			await provider.addItem(BASICS_COLLECTION, { ...basic999, num: "bad" } as never);
			expect.unreachable();
		} catch (thrown) {
			expect(thrown).toBe("num: Must be number");
		}
		expect(source.calls).toHaveLength(0);
	});

	test("validates updateItem() updates before calling the source provider", async () => {
		const source = new MockDBProvider();
		const provider = new ValidationDBProvider(source);

		try {
			await provider.updateItem(BASICS_COLLECTION, "basic1", { num: "bad" } as never);
			expect.unreachable();
		} catch (thrown) {
			expect(thrown).toBeInstanceOf(ValueError);
		}
		expect(source.calls).toHaveLength(0);
	});

	test("keeps sum, array and path updates for the source provider", async () => {
		const source = new MockDBProvider();
		await source.setItem(BASICS_COLLECTION, "basic1", basic1);
		const provider = new ValidationDBProvider(source);

		await provider.updateItem(BASICS_COLLECTION, "basic1", { str: "NEW", "+=num": 5, "+[]tags": "new" });
		const item = await source.getItem(BASICS_COLLECTION, "basic1");
		expect(item?.str).toBe("NEW");
		expect(item?.num).toBe(basic1.num + 5);
		expect(item?.tags).toContain("new");
	});

	test("rejects a sum update that is not a number", async () => {
		const source = new MockDBProvider();
		const provider = new ValidationDBProvider(source);

		try {
			await provider.updateItem(BASICS_COLLECTION, "basic1", { "+=num": "bad" } as never);
			expect.unreachable();
		} catch (thrown) {
			expect(thrown).toBeInstanceOf(Error);
		}
		expect(source.calls).toHaveLength(0);
	});

	test("validates nested updateItem() updates before calling the source provider", async () => {
		const source = new MockDBProvider();
		const provider = new ValidationDBProvider(source);

		for (const updates of [{ "sub.num": "bad" }, { sub: { str: "a", num: "bad" } }, { "+=sub.str": 1 }, { "sub.nope": 1 }]) {
			try {
				await provider.updateItem(BASICS_COLLECTION, "basic1", updates as never);
				expect.unreachable();
			} catch (thrown) {
				expect(thrown).toBeInstanceOf(ValueError);
			}
		}
		expect(source.calls).toHaveLength(0);
	});

	test("keeps valid nested updates for the source provider", async () => {
		const source = new MockDBProvider();
		await source.setItem(BASICS_COLLECTION, "basic1", basic1);
		const provider = new ValidationDBProvider(source);

		await provider.updateItem(BASICS_COLLECTION, "basic1", { "sub.str": "NEW", "+=sub.num": 1 });
		const item = await source.getItem(BASICS_COLLECTION, "basic1");
		expect(item?.sub).toEqual({ ...basic1.sub, str: "NEW", num: basic1.sub.num + 1 });
	});

	test("validates queries before calling the source provider", async () => {
		const source = new MockDBProvider();
		const provider = new ValidationDBProvider(source);

		const query = { "sub.num>": "bad" } as never;
		await expect((async () => provider.countQuery(BASICS_COLLECTION, query))()).rejects.toBeInstanceOf(ValueError);
		await expect((async () => provider.getQuery(BASICS_COLLECTION, query))()).rejects.toBeInstanceOf(ValueError);
		await expect((async () => provider.getQuerySequence(BASICS_COLLECTION, query)[Symbol.asyncIterator]().next())()).rejects.toBeInstanceOf(
			ValueError,
		);
		await expect((async () => provider.setQuery(BASICS_COLLECTION, query, basic999))()).rejects.toBeInstanceOf(ValueError);
		await expect((async () => provider.updateQuery(BASICS_COLLECTION, query, { str: "NEW" }))()).rejects.toBeInstanceOf(ValueError);
		await expect((async () => provider.deleteQuery(BASICS_COLLECTION, { nope: 1 } as never))()).rejects.toBeInstanceOf(ValueError);
		expect(source.calls).toHaveLength(0);
	});

	test("passes valid queries to the source provider", async () => {
		const source = new MockDBProvider();
		await source.setItem(BASICS_COLLECTION, "basic1", basic1);
		await source.setItem(BASICS_COLLECTION, "basic2", basic2);
		const provider = new ValidationDBProvider(source);

		expect(
			await provider.getQuery(BASICS_COLLECTION, { id: ["basic1"], "sub.num>": 0, "tags[]": basic1.tags[0], $order: "!sub.num" }),
		).toEqual([basic1]);
	});

	test("query writes are passthrough: the source receives the query write itself", async () => {
		const source = new MockDBProvider();
		await source.setItem(BASICS_COLLECTION, "basic1", basic1);
		source.calls.length = 0;
		const provider = new ValidationDBProvider(source);

		await provider.setQuery(BASICS_COLLECTION, { group: "a" }, basic999);
		await provider.updateQuery(BASICS_COLLECTION, { group: "a" }, { str: "NEW" });
		await provider.deleteQuery(BASICS_COLLECTION, { group: "a" });

		// One native query write each — no resolve reads, no per-item writes.
		expect(source.calls.map(({ type }) => type)).toEqual(["setQuery", "updateQuery", "deleteQuery"]);
	});

	test("validates updateQuery() updates before calling the source provider", async () => {
		const source = new MockDBProvider();
		const provider = new ValidationDBProvider(source);

		try {
			await provider.updateQuery(BASICS_COLLECTION, {}, { num: "bad" } as never);
			expect.unreachable();
		} catch (thrown) {
			expect(thrown).toBeInstanceOf(ValueError);
		}
		expect(source.calls).toHaveLength(0);
	});

	test("validates reads inside transact()", async () => {
		const source = new TransactionTestDBProvider();
		source.getTable(BASICS_COLLECTION).setItem("basic1", { ...basic1, num: "bad" } as never);
		const provider = new ValidationDBProvider(source);

		await provider.transact(async tx => {
			await expect(tx.getItem(BASICS_COLLECTION, "basic1")).rejects.toBeInstanceOf(ValueError);
		});
	});

	test("validates writes inside transact()", async () => {
		const source = new TransactionTestDBProvider();
		const provider = new ValidationDBProvider(source);

		await provider.transact(async tx => {
			await tx.setItem(BASICS_COLLECTION, "basic1", basic999);
		});
		expect(await source.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic999);

		try {
			await provider.transact(async tx => {
				await tx.setItem(BASICS_COLLECTION, "basic2", { ...basic999, num: "bad" } as never);
			});
			expect.unreachable();
		} catch (thrown) {
			expect(thrown).toBe("num: Must be number");
		}
		// The invalid write never reached the source.
		expect(await source.countQuery(BASICS_COLLECTION, {})).toBe(1);
	});
});

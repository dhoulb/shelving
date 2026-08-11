import { describe, expect, test } from "bun:test";
import { MockDBProvider, ValidationDBProvider } from "shelving/db";
import { ValueError } from "shelving/error";
import { BASICS_COLLECTION, basic1, basic2, basic999, TransactionTestDBProvider } from "../../test/index.js";

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

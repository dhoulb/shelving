import { describe, expect, test } from "bun:test";
import { MockDBProvider, ValidationDBProvider, ValueError } from "../../index.js";
import { BASICS_COLLECTION, basic1, basic2, basic999 } from "../../test/index.js";

describe("ValidationDBProvider", () => {
	test("rejects invalid items returned by the source provider", async () => {
		const source = new MockDBProvider();
		source.getTable(BASICS_COLLECTION).setItem("basic1", { ...basic1, num: "bad" } as never);
		const provider = new ValidationDBProvider(source);

		await expect(provider.getItem(BASICS_COLLECTION, "basic1")).rejects.toBeInstanceOf(ValueError);
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
});

import { describe, expect, test } from "bun:test";
import { DebugDBProvider, MockDBProvider } from "../../index.js";
import { BASICS_COLLECTION, basic1 } from "../../test/index.js";

describe("DebugDBProvider", () => {
	test("logs successful reads through the source provider", async () => {
		const source = new MockDBProvider();
		await source.setItem(BASICS_COLLECTION, "basic1", basic1);
		const provider = new DebugDBProvider(source);
		const logs: unknown[][] = [];
		const debug = console.debug;

		try {
			console.debug = (...args) => void logs.push(args);
			expect(await provider.getItem(BASICS_COLLECTION, "basic1")).toMatchObject(basic1);
		} finally {
			console.debug = debug;
		}

		expect(logs).toEqual([
			["⋯ GET", "basics", "basic1"],
			["↩ GET", "basics", "basic1", basic1],
		]);
	});

	test("logs failed reads and rethrows the source error", async () => {
		class FailingMockDBProvider extends MockDBProvider {
			override async getItem(): Promise<never> {
				throw new Error("Nope");
			}
		}

		const provider = new DebugDBProvider(new FailingMockDBProvider());
		const logs: unknown[][] = [];
		const debug = console.debug;
		const error = console.error;

		try {
			console.debug = () => undefined;
			console.error = (...args) => void logs.push(args);
			await expect(provider.getItem(BASICS_COLLECTION, "basic1")).rejects.toThrow("Nope");
		} finally {
			console.debug = debug;
			console.error = error;
		}

		expect(logs).toHaveLength(1);
		expect(logs[0]?.slice(0, 3)).toEqual(["✘ GET", "basics", "basic1"]);
		expect(logs[0]?.[3]).toBeInstanceOf(Error);
	});
});

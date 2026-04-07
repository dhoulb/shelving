import { describe, expect, test } from "bun:test";
import { CloudflareD1Provider, type D1Database, type D1PreparedStatement, type D1Value } from "./index.js";

type D1Call = {
	readonly query: string;
	readonly values: readonly D1Value[];
};

describe("CloudflareD1Provider", () => {
	test("serializes arrays and plain objects to JSON strings", async () => {
		const { db, calls } = _getMockD1();
		const provider = new CloudflareD1Provider(db);

		await provider.exec`SELECT ${["abc", { count: 2, enabled: true }, null]}`;

		expect(calls).toEqual([{ query: "SELECT ?", values: ['["abc",{"count":2,"enabled":true},null]'] }]);
	});
});

function _getMockD1(): { readonly calls: D1Call[]; readonly db: D1Database } {
	const calls: D1Call[] = [];
	const db: D1Database = {
		batch: async () => [],
		prepare(query: string): D1PreparedStatement {
			const statement: D1PreparedStatement = {
				bind(...values: D1Value[]): D1PreparedStatement {
					calls.push({ query, values });
					return statement;
				},
				first: async () => null,
				raw: async () => [],
				run: async () => ({ success: true, results: [] }),
			};
			return statement;
		},
	};
	return { calls, db };
}

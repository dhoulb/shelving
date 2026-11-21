import { afterAll, describe, expect, test } from "bun:test";
import { CloudflareD1Provider, type D1Database, type D1PreparedStatement, type D1Value } from "shelving/cloudflare";
import { SQLiteMigrator } from "shelving/db";
import { BASICS_COLLECTION, PEOPLE_COLLECTION, testDBDifferential, testDBProvider, testSQLMigrator } from "../test/index.js";

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

// Run the DBProvider contract suite, the differential test and the SQLMigrator contract suite against a real D1 database.
// The SQLiteMigrator makes the fixture tables, so the provider tests also prove the migrator's table layout.
// Miniflare runs `workerd`, the runtime Cloudflare runs in production, with its D1 engine on a local SQLite file.
// Run via: bun run cloudflare — it sets MINIFLARE, because these tests take a few seconds.
if (process.env.MINIFLARE) {
	const { Miniflare } = await import("miniflare");
	const miniflare = new Miniflare({ modules: true, script: "export default { fetch: () => new Response(null) }", d1Databases: ["DB"] });
	afterAll(() => miniflare.dispose());
	const db = (await miniflare.getD1Database("DB")) as unknown as D1Database; // `as` needed: Miniflare returns its own D1 type.
	const provider = new CloudflareD1Provider<string>(db);
	const migrator = new SQLiteMigrator(provider);
	await migrator.migrate(BASICS_COLLECTION, PEOPLE_COLLECTION);

	testDBProvider("CloudflareD1Provider", () => provider, { realtime: false });
	testDBDifferential("CloudflareD1Provider", () => provider, { runs: 10 }); // Each D1 query in Miniflare takes about 4.5ms, so run fewer sequences than the default 25.
	testSQLMigrator("SQLiteMigrator on CloudflareD1Provider", () => migrator);
}

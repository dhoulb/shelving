import { describe, expect, test } from "bun:test";
import { COLLECTION } from "../db/collection/Collection.js";
import type { SQLMigrator } from "../db/migrate/SQLMigrator.js";
import type { SQLProvider } from "../db/provider/SQLProvider.js";
import { ARRAY } from "../schema/ArraySchema.js";
import { BOOLEAN } from "../schema/BooleanSchema.js";
import { DATA } from "../schema/DataSchema.js";
import { INTEGER, NUMBER } from "../schema/NumberSchema.js";
import { STRING } from "../schema/StringSchema.js";
import { BASICS_COLLECTION } from "./basics.js";
import { PEOPLE_COLLECTION } from "./people.js";

// Three versions of one collection, to test how a migrator changes a table that already has data.
const _V1 = COLLECTION("migrated", STRING, { a: STRING, b: NUMBER, c: BOOLEAN });
const _V2 = COLLECTION("migrated", STRING, { a: STRING, c: BOOLEAN, d: ARRAY(STRING), e: DATA({ f: NUMBER }) }); // Drops `b`, adds `d` and `e`.
const _V3 = COLLECTION("migrated", STRING, { a: INTEGER, c: BOOLEAN, d: ARRAY(STRING), e: DATA({ f: NUMBER }) }); // Changes the type of `a`.

/**
 * Register the `SQLMigrator` contract test suite against a migrator and its real database.
 *
 * - Call it after the migrator made the `BASICS_COLLECTION` and `PEOPLE_COLLECTION` tables, so the first test can check that they need no changes.
 * - The other tests drop and make a `migrated` table, then change it with three versions of a collection, and check that the provider can still read and write it.
 *
 * @param name Name for the migrator, used in the `describe` block.
 * @param createMigrator Create (or return) the migrator to test.
 * @example testSQLMigrator("SQLiteMigrator", () => new SQLiteMigrator(provider));
 * @see https://shelving.cc/test/testSQLMigrator
 */
export function testSQLMigrator(
	name: string,
	createMigrator: () => SQLMigrator<SQLProvider<string>> | PromiseLike<SQLMigrator<SQLProvider<string>>>,
): void {
	// Create the migrator and drop the `migrated` table, so each test starts clean.
	async function init(): Promise<SQLMigrator<SQLProvider<string>>> {
		const migrator = await createMigrator();
		await migrator.provider.exec`DROP TABLE IF EXISTS ${migrator.provider.sqlIdentifier("migrated")}`;
		return migrator;
	}

	describe(`SQLMigrator contract: ${name}`, () => {
		test("makes no changes to tables that already match", async () => {
			const migrator = await createMigrator();
			expect(await migrator.getMigrations(BASICS_COLLECTION, PEOPLE_COLLECTION)).toEqual([]);
		});

		test("makes a table that the provider can read and write", async () => {
			const migrator = await init();
			const { provider } = migrator;
			await migrator.migrate(_V1);
			expect(await migrator.getMigrations(_V1)).toEqual([]);
			await provider.setItem(_V1, "x", { a: "A", b: 1.5, c: true });
			expect(await provider.getItem(_V1, "x")).toMatchObject({ id: "x", a: "A", b: 1.5, c: true });
			const id = await provider.addItem(_V1, { a: "B", b: 2, c: false });
			expect(id).toBeString();
			expect(await provider.getItem(_V1, id)).toMatchObject({ a: "B", b: 2, c: false });
		});

		test("adds and drops columns, and keeps the data in the other columns", async () => {
			const migrator = await init();
			const { provider } = migrator;
			await migrator.migrate(_V1);
			await provider.setItem(_V1, "x", { a: "A", b: 1, c: true });
			await migrator.migrate(_V2);
			expect(await migrator.getMigrations(_V2)).toEqual([]);
			const item = await provider.getItem(_V2, "x");
			expect(item).toMatchObject({ id: "x", a: "A", c: true });
			expect(item).not.toHaveProperty("b");
			await provider.updateItem(_V2, "x", { d: ["p", "q"], e: { f: 2.5 } });
			await provider.updateItem(_V2, "x", { "+[]d": "r", "+=e.f": 1 });
			expect(await provider.getItem(_V2, "x")).toMatchObject({ a: "A", c: true, d: ["p", "q", "r"], e: { f: 3.5 } });
		});

		test("changes the type of a column", async () => {
			const migrator = await init();
			const { provider } = migrator;
			await migrator.migrate(_V2);
			await migrator.migrate(_V3);
			expect(await migrator.getMigrations(_V3)).toEqual([]);
			await provider.setItem(_V3, "x", { a: 3, c: false, d: [], e: { f: 1 } });
			expect(await provider.getItem(_V3, "x")).toMatchObject({ a: 3, c: false, d: [], e: { f: 1 } });
			expect(await provider.getQuery(_V3, { "a>": 2 })).toHaveLength(1);
		});
	});
}

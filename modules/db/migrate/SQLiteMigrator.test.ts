import { Database, type SQLQueryBindings } from "bun:sqlite";
import { expect, test } from "bun:test";
import { type SQLFragment, SQLiteMigrator, SQLiteProvider } from "shelving/db";
import type { Data } from "shelving/util/data";
import { BASICS_COLLECTION, PEOPLE_COLLECTION, testDBDifferential, testDBProvider, testSQLMigrator } from "../../test/index.js";

/** SQLite provider on an in-memory `bun:sqlite` database. Arrays and objects bind as JSON text, the same as D1. */
class TestSQLiteProvider extends SQLiteProvider<string> {
	readonly sqlite = new Database(":memory:", { strict: true });

	override async exec<T extends Data = Data>(strings: TemplateStringsArray, ...values: readonly unknown[]): Promise<readonly T[]> {
		const { query, values: bindings } = _getSQLQuery(strings, values);
		return this.sqlite.query(query).all(...bindings) as T[];
	}
}

const provider = new TestSQLiteProvider();
const migrator = new SQLiteMigrator(provider);
await migrator.migrate(BASICS_COLLECTION, PEOPLE_COLLECTION);

// The migrator makes the fixture tables, so these suites also prove the migrator's table layout.
testDBProvider("SQLiteProvider (bun:sqlite)", () => provider, { realtime: false });
testDBDifferential("SQLiteProvider (bun:sqlite)", () => provider, { runs: 10 });
testSQLMigrator("SQLiteMigrator (bun:sqlite)", () => migrator);

test("SQLiteMigrator: makes a strict table with one column for each prop", () => {
	expect(migrator.getCreateTableQuery(BASICS_COLLECTION)).toBe(
		[
			`CREATE TABLE "basics" (`,
			`  "id" TEXT PRIMARY KEY,`,
			`  "str" TEXT,`,
			`  "num" REAL,`,
			`  "group" TEXT,`,
			`  "tags" TEXT CHECK (json_valid("tags")),`,
			`  "odd" INTEGER,`,
			`  "even" INTEGER,`,
			`  "sub" TEXT CHECK (json_valid("sub"))`,
			`) STRICT;`,
		].join("\n"),
	);
});

function _getSQLQuery(strings: readonly string[], values: readonly unknown[]): { query: string; values: SQLQueryBindings[] } {
	let query = strings[0] ?? "";
	const bindings: SQLQueryBindings[] = [];
	for (const [index, value] of values.entries()) {
		if (_isFragment(value)) {
			const part = _getSQLQuery(value.strings, value.values);
			query += part.query;
			bindings.push(...part.values);
		} else {
			query += "?";
			bindings.push(value !== null && typeof value === "object" ? JSON.stringify(value) : (value as SQLQueryBindings));
		}
		query += strings[index + 1] ?? "";
	}
	return { query, values: bindings };
}

function _isFragment(value: unknown): value is SQLFragment {
	return typeof value === "object" && !!value && "strings" in value && "values" in value;
}

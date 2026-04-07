import { Database, type SQLQueryBindings } from "bun:sqlite";
import { expect, test } from "bun:test";
import { ARRAY, COLLECTION, DATA, type Data, INTEGER, type SQLFragment, SQLiteMigrator, SQLProvider, STRING } from "../../index.js";
import { BASIC_SCHEMA } from "../../test/index.js";

const BASICS_COLLECTION = COLLECTION("basics", INTEGER, BASIC_SCHEMA);

const SCORES_COLLECTION = COLLECTION(
	"scores",
	INTEGER,
	DATA({
		name: STRING,
		group: STRING,
		tags: ARRAY(STRING),
		sub: DATA({ rank: INTEGER, label: STRING }),
	}),
);

class TestSQLProvider extends SQLProvider {
	readonly sqlite = new Database(":memory:");

	close(): void {
		this.sqlite.close();
	}

	override async exec<T extends Data = Data>(strings: TemplateStringsArray, ...values: readonly unknown[]): Promise<readonly T[]>;
	override async exec(strings: TemplateStringsArray, ...values: readonly unknown[]): Promise<readonly unknown[]> {
		const { query, values: bindings } = _getSQLQuery(strings, values);
		const statement = this.sqlite.query(query);
		if (_isReadQuery(query)) return statement.all(...bindings);
		statement.run(...bindings);
		return [];
	}
}

test("SQLiteMigrator: generates create table SQL without secondary indexes", () => {
	const provider = new TestSQLProvider();
	try {
		const migrator = new SQLiteMigrator(provider);
		const query = migrator.getCreateTableQuery(BASICS_COLLECTION);
		expect(query).toContain(`CREATE TABLE "basics"`);
		expect(query).toContain(`"id" INTEGER PRIMARY KEY`);
		expect(query).toContain(`"data" TEXT NOT NULL CHECK (json_valid("data"))`);
		expect(query).toContain(`"sub__str" TEXT GENERATED ALWAYS AS`);
		expect(query).toContain(`"sub__num" REAL GENERATED ALWAYS AS`);
		expect(query).toContain("STRICT");
		expect(query).not.toContain("INDEX");
	} finally {
		provider.close();
	}
});

test("SQLiteMigrator: migrate creates strict tables with generated scalar columns only", async () => {
	const provider = new TestSQLProvider();
	try {
		await new SQLiteMigrator(provider).migrate(BASICS_COLLECTION, SCORES_COLLECTION);

		const basicsColumns = provider.sqlite.query(`PRAGMA table_xinfo("basics")`).all() as { name: string }[];
		expect(basicsColumns.map(({ name }) => name)).toEqual([
			"id",
			"data",
			"str",
			"num",
			"group",
			"odd",
			"even",
			"sub__str",
			"sub__num",
			"sub__odd",
			"sub__even",
		]);

		const scoresColumns = provider.sqlite.query(`PRAGMA table_xinfo("scores")`).all() as { name: string; type: string }[];
		expect(scoresColumns[0]).toMatchObject({ name: "id", type: "INTEGER" });
		expect(scoresColumns.map(({ name }) => name)).toContain("sub__rank");
		expect(scoresColumns.map(({ name }) => name)).toContain("sub__label");
		expect(scoresColumns.map(({ name }) => name)).not.toContain("tags");

		const basicsSQL = provider.sqlite.query(`SELECT sql FROM sqlite_master WHERE name = ?1`).get("basics") as { sql: string };
		expect(basicsSQL.sql).toContain("CREATE TABLE");
		expect(basicsSQL.sql).not.toContain("CREATE INDEX");
	} finally {
		provider.close();
	}
});

test("SQLiteMigrator: migrate diffs existing tables before adding missing generated columns", async () => {
	const provider = new TestSQLProvider();
	try {
		provider.sqlite.exec(`CREATE TABLE "basics" ("id" INTEGER PRIMARY KEY, "data" TEXT NOT NULL CHECK (json_valid("data"))) STRICT;`);
		await new SQLiteMigrator(provider).migrate(BASICS_COLLECTION);

		const columns = provider.sqlite.query(`PRAGMA table_xinfo("basics")`).all() as { name: string }[];
		expect(columns.map(({ name }) => name)).toEqual([
			"id",
			"data",
			"str",
			"num",
			"group",
			"odd",
			"even",
			"sub__str",
			"sub__num",
			"sub__odd",
			"sub__even",
		]);
	} finally {
		provider.close();
	}
});

function _getSQLQuery(strings: readonly string[], values: readonly unknown[]): { query: string; values: readonly SQLQueryBindings[] } {
	let query = strings[0] ?? "";
	const bindings: SQLQueryBindings[] = [];
	for (const [index, value] of values.entries()) {
		if (_isFragment(value)) {
			const part = _getSQLQuery(value.strings, value.values);
			query += part.query;
			bindings.push(...part.values);
		} else {
			query += "?";
			bindings.push(value as SQLQueryBindings);
		}
		query += strings[index + 1] ?? "";
	}
	return { query, values: bindings };
}

function _isFragment(value: unknown): value is SQLFragment {
	return typeof value === "object" && !!value && "strings" in value && "values" in value;
}

function _isReadQuery(query: string): boolean {
	return /^\s*(?:select|pragma|with)\b/i.test(query);
}

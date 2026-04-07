import { expect, test } from "bun:test";
import { DATA, INTEGER, PostgreSQLMigrator, SQLProvider, STRING } from "../../index.js";
import type { Schema } from "../../schema/Schema.js";

class TestSQLProvider extends SQLProvider {
	override async exec<T extends Record<string, unknown> = Record<string, unknown>>(
		strings: TemplateStringsArray,
		...values: readonly unknown[]
	): Promise<readonly T[]> {
		void strings;
		void values;
		return [];
	}
}

class TestPostgresMigrator extends PostgreSQLMigrator<TestSQLProvider> {
	exposeDefinition(schema: Schema<unknown>): string | undefined {
		return this.definition(schema);
	}

	exposeGeneratedColumnDefinition(columnName: string, path: string, definition: string): string {
		return this.getGeneratedColumnDefinition(columnName, path, definition);
	}
}

test("PostgresMigrator: maps schemas to postgres types", () => {
	const provider = new TestSQLProvider();
	const migrator = new TestPostgresMigrator(provider);
	expect(migrator.exposeDefinition(STRING)).toBe("text");
	expect(migrator.exposeDefinition(INTEGER)).toBe("bigint");
	expect(migrator.exposeDefinition(DATA({ name: STRING }))).toBe("jsonb");
});

test("PostgresMigrator: builds generated column expressions from json data", () => {
	const provider = new TestSQLProvider();
	const migrator = new TestPostgresMigrator(provider);
	expect(migrator.exposeGeneratedColumnDefinition("sub__rank", '$."sub"."rank"', "bigint")).toBe(
		`bigint GENERATED ALWAYS AS (("data" #>> '{sub,rank}')::bigint) STORED`,
	);
	expect(migrator.exposeGeneratedColumnDefinition("sub__label", '$."sub"."label"', "text")).toBe(
		`text GENERATED ALWAYS AS ("data" #>> '{sub,label}') STORED`,
	);
});

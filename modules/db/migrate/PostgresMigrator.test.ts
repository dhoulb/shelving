import { expect, test } from "bun:test";
import { PostgresMigrator, SQLProvider } from "shelving/db";
import { ARRAY, BOOLEAN, DATA, DATE, INTEGER, NUMBER, type Schema, STRING } from "shelving/schema";

class TestSQLProvider extends SQLProvider {
	override async exec<T extends Record<string, unknown> = Record<string, unknown>>(): Promise<readonly T[]> {
		return [];
	}
}

class TestPostgresMigrator extends PostgresMigrator<TestSQLProvider> {
	exposeDefinition(schema: Schema<unknown>): string | undefined {
		return this.definition(schema);
	}
}

test("PostgresMigrator: maps schemas to types that Bun reads back as the same values", () => {
	const migrator = new TestPostgresMigrator(new TestSQLProvider());
	expect(migrator.exposeDefinition(STRING)).toBe("text");
	expect(migrator.exposeDefinition(DATE)).toBe("text");
	expect(migrator.exposeDefinition(NUMBER)).toBe("double precision");
	expect(migrator.exposeDefinition(INTEGER)).toBe("double precision"); // Outside the `integer` range.
	expect(migrator.exposeDefinition(BOOLEAN)).toBe("boolean");
	expect(migrator.exposeDefinition(ARRAY(STRING))).toBe("jsonb");
	expect(migrator.exposeDefinition(DATA({ name: STRING }))).toBe("jsonb");
});

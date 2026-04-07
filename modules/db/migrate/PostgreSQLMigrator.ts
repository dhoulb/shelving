import { ArraySchema } from "../../schema/ArraySchema.js";
import { BooleanSchema } from "../../schema/BooleanSchema.js";
import { ChoiceSchema } from "../../schema/ChoiceSchema.js";
import { DataSchema } from "../../schema/DataSchema.js";
import { DateSchema } from "../../schema/DateSchema.js";
import { DateTimeSchema } from "../../schema/DateTimeSchema.js";
import { DictionarySchema } from "../../schema/DictionarySchema.js";
import { NullableSchema } from "../../schema/NullableSchema.js";
import { NumberSchema } from "../../schema/NumberSchema.js";
import type { Schema } from "../../schema/Schema.js";
import { StringSchema } from "../../schema/StringSchema.js";
import { TimeSchema } from "../../schema/TimeSchema.js";
import type { Data } from "../../util/data.js";
import type { Identifier } from "../../util/item.js";
import { getSource } from "../../util/source.js";
import type { Collection } from "../collection/Collection.js";
import type { SQLProvider } from "../provider/SQLProvider.js";
import { SQLMigrator, type SQLTable, type SQLTableColumn } from "./SQLMigrator.js";

const INT4_MAX = 2147483647;
const INT4_MIN = -2147483648;
const COMPATIBLE_NUMBER_TYPES = ["integer", "bigint", "numeric", "int", "int4", "int8"];
const COMPATIBLE_STRING_TYPES = ["character varying", "varchar", "text", "char", "character"];

type PostgreSQLColumnRow = {
	readonly generated: boolean;
	readonly identity: boolean;
	readonly name: string;
	readonly nullable: boolean;
	readonly primary: boolean;
	readonly type: string;
	readonly value: string | null;
};

/** PostgreSQL migrator using pg_catalog-style schema inspection. */
export class PostgreSQLMigrator<T extends SQLProvider = SQLProvider> extends SQLMigrator<T> {
	protected override async getTables(): Promise<readonly string[]> {
		const rows = await this.provider.exec<{ name: string }>`
			SELECT c.relname AS ${this.provider.sqlIdentifier("name")}
			FROM ${this.provider.sqlIdentifier("pg_class")} c
			JOIN ${this.provider.sqlIdentifier("pg_namespace")} n ON n.oid = c.relnamespace
			WHERE c.relkind = ${"r"} AND n.nspname = ${"public"}
			ORDER BY c.relname
		`;
		return rows.map(({ name }) => name);
	}

	protected override async getTable(name: string): Promise<SQLTable | undefined> {
		const rows = await this.provider.exec<PostgreSQLColumnRow>`
			SELECT
				a.attname AS ${this.provider.sqlIdentifier("name")},
				pg_catalog.format_type(a.atttypid, a.atttypmod) AS ${this.provider.sqlIdentifier("type")},
				NOT a.attnotnull AS ${this.provider.sqlIdentifier("nullable")},
					pg_get_expr(ad.adbin, ad.adrelid) AS ${this.provider.sqlIdentifier("value")},
					a.attgenerated = ${"s"} AS ${this.provider.sqlIdentifier("generated")},
					a.attidentity = ${"a"} AS ${this.provider.sqlIdentifier("identity")},
					EXISTS (
						SELECT 1
						FROM ${this.provider.sqlIdentifier("pg_index")} i
						WHERE i.indrelid = c.oid
							AND i.indisprimary
							AND a.attnum = ANY(i.indkey)
					) AS ${this.provider.sqlIdentifier("primary")}
				FROM ${this.provider.sqlIdentifier("pg_class")} c
				JOIN ${this.provider.sqlIdentifier("pg_attribute")} a ON a.attrelid = c.oid
				LEFT JOIN ${this.provider.sqlIdentifier("pg_attrdef")} ad ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
				WHERE c.relkind = ${"r"}
					AND c.relnamespace = ${"public"}::regnamespace
					AND a.attnum > ${0}
				AND c.relname = ${name}
				AND NOT a.attisdropped
			ORDER BY a.attnum
		`;
		if (!rows.length) return undefined;
		return {
			name,
			columns: Object.fromEntries(rows.map(row => [row.name, { name: row.name, statement: this.getCurrentColumnStatement(row) }])),
		};
	}

	protected override getCreateTableSuffix<TData extends Data>(_collection: Collection<string, Identifier, TData>): string {
		return "";
	}

	protected override getDataColumnDefinition(): string {
		return `jsonb NOT NULL DEFAULT ${this.quoteString("{}")}::jsonb`;
	}

	protected override getGeneratedColumnDefinition(_columnName: string, path: string, definition: string): string {
		const expression = this.getGeneratedExpression(path, definition);
		return `${definition} GENERATED ALWAYS AS (${expression}) STORED`;
	}

	protected override getIDColumnDefinition<TData extends Data>(collection: Collection<string, Identifier, TData>): string {
		const id = collection.id;
		if (id instanceof NumberSchema && id.step === 1) return "integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY";
		return "text PRIMARY KEY";
	}

	protected override getAlterColumnQueries(tableName: string, from: SQLTableColumn, to: SQLTableColumn): readonly string[] {
		const parsedFrom = this.parseColumn(from);
		const parsedTo = this.parseColumn(to);
		if (!parsedFrom || !parsedTo || parsedFrom.generated || parsedTo.generated) return super.getAlterColumnQueries(tableName, from, to);
		const table = this.quoteIdentifier(tableName);
		const column = this.quoteIdentifier(to.name);
		const migrations: string[] = [];
		if (parsedFrom.type !== parsedTo.type) {
			if (_areCompatibleTypes(parsedFrom.type, parsedTo.type)) {
				migrations.push(`ALTER TABLE ${table} ALTER COLUMN ${column} TYPE ${parsedTo.type} USING ${column}::${parsedTo.type};`);
			} else {
				return super.getAlterColumnQueries(tableName, from, to);
			}
		}
		if (parsedFrom.nullable !== parsedTo.nullable) {
			migrations.push(`ALTER TABLE ${table} ALTER COLUMN ${column} ${parsedTo.nullable ? "DROP" : "SET"} NOT NULL;`);
		}
		if ((parsedFrom.defaultValue ?? "NULL") !== (parsedTo.defaultValue ?? "NULL")) {
			migrations.push(`ALTER TABLE ${table} ALTER COLUMN ${column} SET DEFAULT ${parsedTo.defaultValue ?? "NULL"};`);
		}
		return migrations.length ? migrations : super.getAlterColumnQueries(tableName, from, to);
	}

	protected override definition<TValue>(schema: Schema<TValue>): string | undefined {
		const value = schema.value;
		void getSource(NullableSchema, schema);
		const str = getSource(StringSchema, schema);
		if (str) return "text";
		const num = getSource(NumberSchema, schema);
		if (num) {
			const type =
				Number.isInteger(num.step) && Number.isInteger(num.min) && Number.isInteger(num.max)
					? num.min >= INT4_MIN && num.max <= INT4_MAX
						? "integer"
						: "bigint"
					: "numeric";
			return type;
		}
		const bool = getSource(BooleanSchema, schema);
		if (bool) return "boolean";
		const choice = getSource(ChoiceSchema, schema);
		if (choice) return "text";
		const arr = getSource(ArraySchema, schema);
		if (arr) return "jsonb";
		const data = getSource(DataSchema, schema);
		if (data) return "jsonb";
		const dict = getSource(DictionarySchema, schema);
		if (dict) return "jsonb";
		const date = getSource(DateSchema, schema);
		if (date) {
			const type = getSource(DateTimeSchema, schema) ? "timestamp with time zone" : getSource(TimeSchema, schema) ? "time" : "date";
			return type;
		}
		switch (typeof value) {
			case "string":
				return "text";
			case "number":
				return Number.isInteger(value) ? "integer" : "numeric";
			case "boolean":
				return "boolean";
			default:
				return undefined;
		}
	}

	protected getCurrentColumnStatement({ generated, identity, name: _name, nullable, primary, type, value }: PostgreSQLColumnRow): string {
		if (identity && primary) return `${type} GENERATED ALWAYS AS IDENTITY PRIMARY KEY`;
		if (generated) return `${type} GENERATED ALWAYS AS (${value ?? "NULL"}) STORED`;
		return `${type}${nullable ? " NULL" : " NOT NULL"} DEFAULT ${value ?? "NULL"}`;
	}

	protected getGeneratedExpression(path: string, definition: string): string {
		const cast = this.getGeneratedCast(definition);
		const parts = path
			.replace(/^\$\./, "")
			.replace(/^\$/, "")
			.split(".")
			.map(part => part.replaceAll(/^"|"$/g, ""));
		const key = parts.map(part => part.replaceAll(`'`, `''`)).join(",");
		const source = `${this.quoteIdentifier("data")} #>> ${this.quoteString(`{${key}}`)}`;
		return cast ? `(${source})::${cast}` : source;
	}

	protected getGeneratedCast(definition: string): string | undefined {
		if (definition.startsWith("integer")) return "integer";
		if (definition.startsWith("bigint")) return "bigint";
		if (definition.startsWith("numeric")) return "numeric";
		if (definition.startsWith("boolean")) return "boolean";
		if (definition.startsWith("timestamp")) return "timestamp with time zone";
		if (definition.startsWith("time")) return "time";
		if (definition.startsWith("date")) return "date";
		return undefined;
	}

	protected parseColumn({ name, statement }: SQLTableColumn):
		| {
				readonly defaultValue?: string | undefined;
				readonly generated: boolean;
				readonly name: string;
				readonly nullable: boolean;
				readonly type: string;
		  }
		| undefined {
		if (statement.endsWith("GENERATED ALWAYS AS IDENTITY PRIMARY KEY")) {
			return { name, type: statement.replace(/\s+GENERATED ALWAYS AS IDENTITY PRIMARY KEY$/, ""), nullable: false, generated: false };
		}
		const generated = statement.match(/^(.+?) GENERATED ALWAYS AS \(([\s\S]+)\) STORED$/);
		if (generated) {
			const type = generated[1];
			if (!type) return undefined;
			return { name, type, nullable: false, generated: true };
		}
		const normal = statement.match(/^(.+?) (NULL|NOT NULL) DEFAULT ([\s\S]+)$/);
		if (!normal) return undefined;
		const [, type, nullable, defaultValue] = normal;
		if (!type || !nullable || !defaultValue) return undefined;
		return { name, type, nullable: nullable === "NULL", generated: false, defaultValue };
	}
}

function _areCompatibleTypes(from: string, to: string): boolean {
	return (
		(COMPATIBLE_NUMBER_TYPES.includes(from) && COMPATIBLE_NUMBER_TYPES.includes(to)) ||
		(COMPATIBLE_STRING_TYPES.includes(from) && COMPATIBLE_STRING_TYPES.includes(to))
	);
}

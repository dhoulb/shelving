import { UnimplementedError } from "../../error/UnimplementedError.js";
import { ChoiceSchema } from "../../schema/ChoiceSchema.js";
import { DateSchema } from "../../schema/DateSchema.js";
import { NumberSchema } from "../../schema/NumberSchema.js";
import type { Data } from "../../util/data.js";
import type { Identifier } from "../../util/item.js";
import type { Collection } from "../collection/Collection.js";
import type { SQLProvider } from "../provider/SQLProvider.js";
import { SQLMigrator, type SQLTable, type SQLTableColumn } from "./SQLMigrator.js";

/** SQLite and D1 migrator using sqlite_master as the schema source of truth. */
export class SQLiteMigrator<T extends SQLProvider = SQLProvider> extends SQLMigrator<T> {
	protected override async getTables(): Promise<readonly string[]> {
		const rows = await this.provider.exec<{ name: string }>`
			SELECT ${this.provider.sqlIdentifier("name")} AS ${this.provider.sqlIdentifier("name")}
			FROM ${this.provider.sqlIdentifier("sqlite_master")}
			WHERE ${this.provider.sqlIdentifier("type")} = ${"table"}
				AND ${this.provider.sqlIdentifier("name")} NOT LIKE ${"sqlite_%"}
			ORDER BY ${this.provider.sqlIdentifier("name")}
		`;
		return rows.map(({ name }) => name);
	}

	protected override async getTable(name: string): Promise<SQLTable | undefined> {
		const rows = await this.provider.exec<{ sql: string }>`
			SELECT ${this.provider.sqlIdentifier("sql")} AS ${this.provider.sqlIdentifier("sql")}
			FROM ${this.provider.sqlIdentifier("sqlite_master")}
			WHERE ${this.provider.sqlIdentifier("type")} = ${"table"}
				AND ${this.provider.sqlIdentifier("name")} = ${name}
			LIMIT 1
		`;
		const sql = rows[0]?.sql;
		if (!sql) return undefined;
		return { name, sql, columns: _getSQLiteColumns(sql) };
	}

	protected override getCreateTableSuffix<TData extends Data>(_collection: Collection<string, Identifier, TData>): string {
		return " STRICT";
	}

	protected override getDataColumnDefinition(): string {
		const data = this.quoteIdentifier("data");
		return `TEXT NOT NULL CHECK (json_valid(${data}))`;
	}

	protected override getGeneratedColumnDefinition(_columnName: string, path: string, definition: string): string {
		return `${definition} GENERATED ALWAYS AS (json_extract(${this.quoteIdentifier("data")}, ${this.quoteString(path)})) STORED`;
	}

	protected override getIDColumnDefinition<TData extends Data>(collection: Collection<string, Identifier, TData>): string {
		const id = collection.id;
		if (id instanceof NumberSchema) {
			if (id.step === 1) return "INTEGER PRIMARY KEY";
			throw new UnimplementedError("SQLiteMigrator only supports string and integer identifiers", { received: id });
		}
		if (id instanceof ChoiceSchema || id instanceof DateSchema) return "TEXT PRIMARY KEY";
		switch (typeof id.value) {
			case "string":
				return "TEXT PRIMARY KEY";
			case "number":
				if (Number.isInteger(id.value)) return "INTEGER PRIMARY KEY";
		}
		return "TEXT PRIMARY KEY";
	}

	protected override getAlterColumnQueries(tableName: string, from: SQLTableColumn, to: SQLTableColumn): readonly string[] {
		if (from.name === "id" || from.name === "data") {
			throw new UnimplementedError(`Cannot alter SQLite column "${from.name}" in existing table "${tableName}"`);
		}
		return super.getAlterColumnQueries(tableName, from, to);
	}
}

function _getSQLiteColumns(sql: string): Readonly<Record<string, SQLTableColumn>> {
	const body = _getCreateTableBody(sql);
	const columns = _splitSQLColumns(body).map<SQLTableColumn | undefined>(entry => {
		const match = entry.match(/^"((?:[^"]|"")+)"\s+([\s\S]+)$/);
		if (!match) return undefined;
		const [, name, statement] = match;
		if (!name || !statement) return undefined;
		return { name: name.replaceAll(`""`, `"`), statement: statement.trim() };
	});
	return Object.fromEntries(columns.filter((column): column is SQLTableColumn => !!column).map(column => [column.name, column]));
}

function _getCreateTableBody(sql: string): string {
	const start = sql.indexOf("(");
	if (start < 0) return "";
	let depth = 0;
	for (let index = start; index < sql.length; index += 1) {
		const char = sql[index];
		if (char === "(") depth += 1;
		if (char === ")") {
			depth -= 1;
			if (depth === 0) return sql.slice(start + 1, index);
		}
	}
	return "";
}

function _splitSQLColumns(value: string): readonly string[] {
	const columns: string[] = [];
	let current = "";
	let depth = 0;
	let quote: "'" | '"' | undefined;
	for (const char of value) {
		current += char;
		if (quote) {
			if (char === quote) quote = undefined;
			continue;
		}
		if (char === "'" || char === '"') {
			quote = char;
			continue;
		}
		if (char === "(") depth += 1;
		else if (char === ")") depth -= 1;
		else if (char === "," && depth === 0) {
			columns.push(current.slice(0, -1).trim());
			current = "";
		}
	}
	if (current.trim()) columns.push(current.trim());
	return columns.filter(column => column && !/^CONSTRAINT\b/i.test(column));
}

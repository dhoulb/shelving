import { UnsupportedError } from "../../error/UnsupportedError.js";
import { ArraySchema } from "../../schema/ArraySchema.js";
import { BooleanSchema } from "../../schema/BooleanSchema.js";
import { ChoiceSchema } from "../../schema/ChoiceSchema.js";
import { DataSchema } from "../../schema/DataSchema.js";
import { DateSchema } from "../../schema/DateSchema.js";
import { DictionarySchema } from "../../schema/DictionarySchema.js";
import { NumberSchema } from "../../schema/NumberSchema.js";
import type { Schema } from "../../schema/Schema.js";
import { StringSchema } from "../../schema/StringSchema.js";
import { ThroughSchema } from "../../schema/ThroughSchema.js";
import type { Data } from "../../util/data.js";
import type { Identifier } from "../../util/item.js";
import type { Collection, Collections } from "../collection/Collection.js";
import type { SQLProvider } from "../provider/SQLProvider.js";
import { DBMigrator } from "./DBMigrator.js";

/**
 * Column definition in a live SQL table, pairing a column name with its raw definition statement.
 * @see https://shelving.cc/db/SQLTableColumn
 */
export type SQLTableColumn = {
	readonly name: string;
	readonly statement: string;
};

/**
 * Existing SQL table schema keyed by column name, as read back from the database.
 * @see https://shelving.cc/db/SQLTable
 */
export type SQLTable = {
	readonly columns: Readonly<Record<string, SQLTableColumn>>;
	readonly name: string;
	readonly sql?: string | undefined;
};

/**
 * Shared SQL migration logic that diffs collection schemas against live tables to produce migration statements.
 *
 * - A table has an `id` column, then one column for each top-level prop, the same layout that `SQLProvider` reads and writes.
 * - Scalar props get a typed column. Arrays, dictionaries and nested data get a JSON column.
 * - Prop columns allow `NULL`, so a column added to an existing table needs no default.
 * - Subclasses implement backend-specific schema inspection and column definitions (e.g. SQLite, PostgreSQL).
 *
 * @see https://shelving.cc/db/SQLMigrator
 */
export abstract class SQLMigrator<T extends SQLProvider<never, never> = SQLProvider> extends DBMigrator<T> {
	/** Run each statement from `getMigrations()` against the provider in order. */
	async migrate(...collections: Collections): Promise<void> {
		for (const migration of await this.getMigrations(...collections)) await this.provider.exec(_getTemplateStrings(migration));
	}

	/**
	 * Compute the SQL statements needed to bring the tables into line with the given collection schemas, without executing them.
	 *
	 * @param collections The collections whose schemas the tables should match.
	 * @returns Promise resolving to the ordered list of SQL migration statements.
	 * @example const sql = await migrator.getMigrations(users)
	 * @see https://shelving.cc/db/SQLMigrator/getMigrations
	 */
	async getMigrations(...collections: Collections): Promise<readonly string[]> {
		const tables = await this.getTables();
		const existing = new Set(tables);
		const migrations: string[] = [];
		for (const collection of collections) {
			const name = collection.name;
			const table = existing.has(name) ? await this.getTable(name) : undefined;
			migrations.push(...this.getTableMigrations(collection, table));
		}
		return migrations;
	}

	/**
	 * Build the `CREATE TABLE` statement for a collection, with its `id` column and one column for each top-level prop.
	 *
	 * @param collection The collection to create a table for.
	 * @returns The `CREATE TABLE` SQL statement.
	 * @example migrator.getCreateTableQuery(users) // CREATE TABLE "users" (...)
	 * @see https://shelving.cc/db/SQLMigrator/getCreateTableQuery
	 */
	getCreateTableQuery<T extends Data>(collection: Collection<string, Identifier, T>): string {
		const suffix = this.getCreateTableSuffix(collection);
		return `CREATE TABLE ${this.quoteIdentifier(collection.name)} (\n${this.getCreateTableColumns(collection)
			.map(column => `  ${this.getTableColumnDefinition(column)}`)
			.join(",\n")}\n)${suffix};`;
	}

	/**
	 * Get the full set of columns for a collection's table: the `id` column, then one column for each top-level prop.
	 *
	 * @param collection The collection to get columns for.
	 * @returns The ordered list of table columns.
	 * @example migrator.getCreateTableColumns(users)
	 * @see https://shelving.cc/db/SQLMigrator/getCreateTableColumns
	 */
	getCreateTableColumns<T extends Data>(collection: Collection<string, Identifier, T>): readonly SQLTableColumn[] {
		return [
			this.getIDColumn(collection),
			...Object.entries<Schema<unknown>>(collection.props).map(([name, schema]) => this.getPropColumn(name, schema)),
		];
	}

	protected getColumnMigrations(tableName: string, from: SQLTableColumn | undefined, to: SQLTableColumn | undefined): readonly string[] {
		if (to) {
			if (!from) return [this.getAddColumnQuery(tableName, to)];
			if (!this.isSameColumn(from, to)) return this.getAlterColumnQueries(tableName, from, to);
			return [];
		}
		if (!from) return [];
		return [this.getDropColumnQuery(tableName, from.name)];
	}

	protected getAlterColumnQueries(tableName: string, from: SQLTableColumn, to: SQLTableColumn): readonly string[] {
		return [this.getDropColumnQuery(tableName, from.name), this.getAddColumnQuery(tableName, to)];
	}

	protected getTableColumnDefinition({ name, statement }: SQLTableColumn): string {
		return `${this.quoteIdentifier(name)} ${statement}`;
	}

	protected getAddColumnQuery(tableName: string, column: SQLTableColumn): string {
		if (column.name === "id") throw new UnsupportedError(`Cannot add primary key column to existing table "${tableName}"`);
		return `ALTER TABLE ${this.quoteIdentifier(tableName)} ADD COLUMN ${this.getTableColumnDefinition(column)};`;
	}

	protected getDropColumnQuery(tableName: string, columnName: string): string {
		if (columnName === "id") throw new UnsupportedError(`Cannot drop primary key column from existing table "${tableName}"`);
		return `ALTER TABLE ${this.quoteIdentifier(tableName)} DROP COLUMN ${this.quoteIdentifier(columnName)};`;
	}

	protected getTableMigrations<T extends Data>(
		collection: Collection<string, Identifier, T>,
		table: SQLTable | undefined,
	): readonly string[] {
		if (!table) return [this.getCreateTableQuery(collection)];
		const desired = this.getCreateTableColumns(collection);
		const wanted = new Map(desired.map(column => [column.name, column]));
		const migrations: string[] = [];
		for (const column of desired) migrations.push(...this.getColumnMigrations(table.name, table.columns[column.name], column));
		for (const column of Object.values(table.columns)) {
			if (!wanted.has(column.name)) migrations.push(...this.getColumnMigrations(table.name, column, undefined));
		}
		return migrations;
	}

	protected getIDColumn<T extends Data>(collection: Collection<string, Identifier, T>): SQLTableColumn {
		return { name: "id", statement: this.getIDColumnDefinition(collection) };
	}

	protected getPropColumn(name: string, schema: Schema<unknown>): SQLTableColumn {
		const statement = this.getPropColumnDefinition(name, schema);
		if (!statement) throw new UnsupportedError(`Cannot make SQL column for "${name}"`, { received: schema });
		return { name, statement };
	}

	/** Whether a schema is stored as JSON: arrays, dictionaries and nested data. */
	protected isJSONSchema(schema: Schema<unknown>): boolean {
		const unwrapped = _unwrapSchema(schema);
		return unwrapped instanceof DataSchema || unwrapped instanceof ArraySchema || unwrapped instanceof DictionarySchema;
	}

	protected isSameColumn(from: SQLTableColumn, to: SQLTableColumn): boolean {
		return _normaliseSQL(from.statement) === _normaliseSQL(to.statement);
	}

	protected quoteIdentifier(value: string): string {
		return `"${value.replaceAll(`"`, `""`)}"`;
	}

	protected quoteString(value: string): string {
		return `'${value.replaceAll(`'`, `''`)}'`;
	}

	protected abstract getTables(): Promise<readonly string[]>;
	protected abstract getTable(name: string): Promise<SQLTable | undefined>;
	protected abstract getCreateTableSuffix<T extends Data>(collection: Collection<string, Identifier, T>): string;
	/** Get the column definition for a prop, e.g. `TEXT`, or `undefined` if the backend can not store the schema. */
	protected abstract getPropColumnDefinition(name: string, schema: Schema<unknown>): string | undefined;
	protected abstract getIDColumnDefinition<T extends Data>(collection: Collection<string, Identifier, T>): string;

	protected definition<TValue>(schema: Schema<TValue>): string | undefined {
		const unwrapped = _unwrapSchema(schema);
		if (unwrapped instanceof DataSchema || unwrapped instanceof ArraySchema || unwrapped instanceof DictionarySchema) return undefined;
		if (unwrapped instanceof NumberSchema) return unwrapped.step === 1 ? "INTEGER" : "REAL";
		if (unwrapped instanceof BooleanSchema) return "INTEGER";
		if (unwrapped instanceof StringSchema || unwrapped instanceof ChoiceSchema || unwrapped instanceof DateSchema) return "TEXT";
		switch (typeof unwrapped.value) {
			case "boolean":
				return "INTEGER";
			case "number":
				return Number.isInteger(unwrapped.value) ? "INTEGER" : "REAL";
			case "string":
				return "TEXT";
			default:
				return undefined;
		}
	}
}

function _unwrapSchema<TValue>(schema: Schema<TValue>): Schema<TValue> {
	let current: Schema<TValue> = schema;
	while (current instanceof ThroughSchema) current = current.source;
	return current;
}

function _normaliseSQL(value: string): string {
	return value.replaceAll(/\s+/g, " ").trim();
}

function _getTemplateStrings(value: string): TemplateStringsArray {
	return Object.assign([value], { raw: [value] }) as TemplateStringsArray;
}

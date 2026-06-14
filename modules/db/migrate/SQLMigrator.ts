import { UnimplementedError } from "../../error/UnimplementedError.js";
import { ArraySchema } from "../../schema/ArraySchema.js";
import { BooleanSchema } from "../../schema/BooleanSchema.js";
import { ChoiceSchema } from "../../schema/ChoiceSchema.js";
import { DataSchema } from "../../schema/DataSchema.js";
import { DateSchema } from "../../schema/DateSchema.js";
import { DictionarySchema } from "../../schema/DictionarySchema.js";
import { NumberSchema } from "../../schema/NumberSchema.js";
import type { Schema, Schemas } from "../../schema/Schema.js";
import { StringSchema } from "../../schema/StringSchema.js";
import { ThroughSchema } from "../../schema/ThroughSchema.js";
import type { Data } from "../../util/data.js";
import type { Collection, Collections } from "../collection/Collection.js";
import type { SQLProvider } from "../provider/SQLProvider.js";
import { DBMigrator } from "./DBMigrator.js";

/**
 * Column definition in a live SQL table, pairing a column name with its raw definition statement.
 * @see https://dhoulb.github.io/shelving/db/migrate/SQLMigrator/SQLTableColumn
 */
export type SQLTableColumn = {
	readonly name: string;
	readonly statement: string;
};

/**
 * Existing SQL table schema keyed by column name, as read back from the database.
 * @see https://dhoulb.github.io/shelving/db/migrate/SQLMigrator/SQLTable
 */
export type SQLTable = {
	readonly columns: Readonly<Record<string, SQLTableColumn>>;
	readonly name: string;
	readonly sql?: string | undefined;
};

/**
 * Generated SQL column mapped from a collection schema path, holding its column name, key, and JSON path.
 * @see https://dhoulb.github.io/shelving/db/migrate/SQLMigrator/SQLColumn
 */
export type SQLColumn = {
	readonly column: string;
	readonly key: string;
	readonly path: string;
};

/**
 * Shared SQL migration logic that diffs collection schemas against live tables to produce migration statements.
 *
 * - Subclasses implement backend-specific schema inspection and column definitions (e.g. SQLite, PostgreSQL).
 *
 * @example
 *  const migrator = new SQLiteMigrator(provider);
 *  await migrator.migrate(users, posts);
 * @see https://dhoulb.github.io/shelving/db/migrate/SQLMigrator/SQLMigrator
 */
export abstract class SQLMigrator<T extends SQLProvider = SQLProvider> extends DBMigrator<T> {
	/**
	 * Bring the provider's tables into line with the given collection schemas by running the generated migrations.
	 *
	 * @param collections The collections whose schemas the tables should match.
	 * @returns Promise that resolves once every migration has been executed.
	 * @throws {UnimplementedError} If a schema feature can't be represented as a SQL column.
	 * @example await migrator.migrate(users, posts)
	 * @see https://dhoulb.github.io/shelving/db/migrate/SQLMigrator/SQLMigrator/migrate
	 */
	async migrate(...collections: Collections<number>): Promise<void> {
		for (const migration of await this.getMigrations(...collections)) await this.provider.exec(_getTemplateStrings(migration));
	}

	/**
	 * Compute the SQL statements needed to bring the tables into line with the given collection schemas, without executing them.
	 *
	 * @param collections The collections whose schemas the tables should match.
	 * @returns Promise resolving to the ordered list of SQL migration statements.
	 * @example const sql = await migrator.getMigrations(users)
	 * @see https://dhoulb.github.io/shelving/db/migrate/SQLMigrator/SQLMigrator/getMigrations
	 */
	async getMigrations(...collections: Collections<number>): Promise<readonly string[]> {
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
	 * Build the `CREATE TABLE` statement for a collection, including its ID, data, and generated columns.
	 *
	 * @param collection The collection to create a table for.
	 * @returns The `CREATE TABLE` SQL statement.
	 * @example migrator.getCreateTableQuery(users) // CREATE TABLE "users" (...)
	 * @see https://dhoulb.github.io/shelving/db/migrate/SQLMigrator/SQLMigrator/getCreateTableQuery
	 */
	getCreateTableQuery<T extends Data>(collection: Collection<string, number, T>): string {
		const suffix = this.getCreateTableSuffix(collection);
		return `CREATE TABLE ${this.quoteIdentifier(collection.name)} (\n${this.getCreateTableColumns(collection)
			.map(column => `  ${this.getTableColumnDefinition(column)}`)
			.join(",\n")}\n)${suffix};`;
	}

	/**
	 * Get the full set of columns for a collection's table: the ID column, data column, and generated columns.
	 *
	 * @param collection The collection to get columns for.
	 * @returns The ordered list of table columns.
	 * @example migrator.getCreateTableColumns(users)
	 * @see https://dhoulb.github.io/shelving/db/migrate/SQLMigrator/SQLMigrator/getCreateTableColumns
	 */
	getCreateTableColumns<T extends Data>(collection: Collection<string, number, T>): readonly SQLTableColumn[] {
		return [this.getIDColumn(collection), this.getDataColumn(), ...this.getGeneratedTableColumns(collection)];
	}

	/**
	 * Get the generated (computed) columns for a collection's table, derived from its schema's scalar properties.
	 *
	 * @param collection The collection to get generated columns for.
	 * @returns The list of generated table columns.
	 * @example migrator.getGeneratedTableColumns(users)
	 * @see https://dhoulb.github.io/shelving/db/migrate/SQLMigrator/SQLMigrator/getGeneratedTableColumns
	 */
	getGeneratedTableColumns<T extends Data>(collection: Collection<string, number, T>): readonly SQLTableColumn[] {
		return this.getGeneratedColumns(collection).map(column => this.getGeneratedColumn(column, collection));
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
		if (column.name === "id") throw new UnimplementedError(`Cannot add primary key column to existing table "${tableName}"`);
		return `ALTER TABLE ${this.quoteIdentifier(tableName)} ADD COLUMN ${this.getTableColumnDefinition(column)};`;
	}

	protected getDropColumnQuery(tableName: string, columnName: string): string {
		if (columnName === "id") throw new UnimplementedError(`Cannot drop primary key column from existing table "${tableName}"`);
		return `ALTER TABLE ${this.quoteIdentifier(tableName)} DROP COLUMN ${this.quoteIdentifier(columnName)};`;
	}

	protected getTableMigrations<T extends Data>(collection: Collection<string, number, T>, table: SQLTable | undefined): readonly string[] {
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

	protected getIDColumn<T extends Data>(collection: Collection<string, number, T>): SQLTableColumn {
		return { name: "id", statement: this.getIDColumnDefinition(collection) };
	}

	protected getDataColumn(): SQLTableColumn {
		return { name: "data", statement: this.getDataColumnDefinition() };
	}

	protected getGeneratedColumn<T extends Data>(
		{ column, key, path }: SQLColumn,
		collection: Collection<string, number, T>,
	): SQLTableColumn {
		const schema = _getColumnSchema(collection, key);
		const definition = this.definition(schema);
		if (!definition) throw new UnimplementedError(`Cannot generate SQL column for "${key}"`, { received: schema });
		return { name: column, statement: this.getGeneratedColumnDefinition(column, path, definition) };
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

	protected getGeneratedColumns<T extends Data>(collection: Collection<string, number, T>): readonly SQLColumn[] {
		return _getColumns(collection.props, this.getColumnName.bind(this), this.getJSONPath.bind(this));
	}

	protected getColumnName(key: string): string {
		return key.replaceAll(".", "__");
	}

	protected getJSONPath(key: string): string {
		return `$${key
			.split(".")
			.map(part => `.${JSON.stringify(part)}`)
			.join("")}`;
	}

	protected abstract getTables(): Promise<readonly string[]>;
	protected abstract getTable(name: string): Promise<SQLTable | undefined>;
	protected abstract getCreateTableSuffix<T extends Data>(collection: Collection<string, number, T>): string;
	protected abstract getDataColumnDefinition(): string;
	protected abstract getGeneratedColumnDefinition(columnName: string, path: string, definition: string): string;
	protected abstract getIDColumnDefinition<T extends Data>(collection: Collection<string, number, T>): string;

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

function _getColumnSchema<T extends Data>(collection: Collection<string, number, T>, key: string): Schema<unknown> {
	let schema: Schema<unknown> = collection;
	for (const part of key.split(".")) {
		const current = _unwrapSchema(schema);
		if (!(current instanceof DataSchema)) throw new UnimplementedError(`Cannot resolve schema path "${key}"`);
		const next = current.props[part];
		if (!next) throw new UnimplementedError(`Cannot resolve schema path "${key}"`);
		schema = next;
	}
	return schema;
}

function _getColumns<T extends Data>(
	props: Schemas<T>,
	getColumnName: (key: string) => string,
	getJSONPath: (key: string) => string,
	prefix = "",
): readonly SQLColumn[] {
	const columns: SQLColumn[] = [];
	for (const [key, schema] of Object.entries(props)) {
		const nextKey = prefix ? `${prefix}.${key}` : key;
		const unwrapped = _unwrapSchema(schema);
		if (unwrapped instanceof DataSchema) columns.push(..._getColumns(unwrapped.props, getColumnName, getJSONPath, nextKey));
		else if (_isColumnSchema(unwrapped)) columns.push({ column: getColumnName(nextKey), key: nextKey, path: getJSONPath(nextKey) });
	}
	return columns;
}

function _isColumnSchema<T>(schema: Schema<T>): boolean {
	const unwrapped = _unwrapSchema(schema);
	if (unwrapped instanceof DataSchema || unwrapped instanceof ArraySchema || unwrapped instanceof DictionarySchema) return false;
	if (
		unwrapped instanceof BooleanSchema ||
		unwrapped instanceof ChoiceSchema ||
		unwrapped instanceof DateSchema ||
		unwrapped instanceof NumberSchema
	)
		return true;
	switch (typeof unwrapped.value) {
		case "boolean":
		case "number":
		case "string":
			return true;
		default:
			return false;
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

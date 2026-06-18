import type { SQL } from "bun";
import { PostgreSQLProvider, type SQLFragment } from "../db/index.js";
import type { ImmutableArray } from "../util/array.js";
import type { Data } from "../util/data.js";
import type { Identifier } from "../util/item.js";

/**
 * PostgreSQL database provider backed by Bun's built-in `Bun.SQL` driver.
 *
 * Implements the [`PostgreSQLProvider`](/db/PostgreSQLProvider) SQL abstraction by executing tagged-template queries against a `Bun.SQL` connection.
 * - Identifiers are escaped through `Bun.SQL`'s own `sql()` helper rather than naive string quoting, which is more secure.
 * - Requires the `bun` peer dependency and a running Bun environment.
 *
 * @example
 * import { SQL } from "bun";
 * const provider = new BunPostgreSQLProvider(new SQL(process.env.DATABASE_URL));
 *
 * @see https://dhoulb.github.io/shelving/bun/BunPostgreSQLProvider/BunPostgreSQLProvider
 */
export class BunPostgreSQLProvider<I extends Identifier = Identifier, T extends Data = Data> extends PostgreSQLProvider<I, T> {
	private _sql: SQL;

	/**
	 * Create a provider wrapping an existing `Bun.SQL` connection.
	 *
	 * @param sql The `Bun.SQL` instance to execute queries against.
	 * @see https://dhoulb.github.io/shelving/bun/BunPostgreSQLProvider/BunPostgreSQLProvider
	 */
	constructor(sql: SQL) {
		super();
		this._sql = sql;
	}

	/**
	 * Execute an SQL query through the underlying `Bun.SQL` connection.
	 *
	 * @param strings The tagged-template string parts of the query.
	 * @param values The interpolated values bound as query parameters.
	 * @returns Promise resolving to the array of result rows.
	 * @example provider.exec`SELECT * FROM ${provider.sqlIdentifier("items")}`
	 * @see https://dhoulb.github.io/shelving/bun/BunPostgreSQLProvider/BunPostgreSQLProvider/exec
	 */
	override exec<X extends Data>(strings: TemplateStringsArray, ...values: ImmutableArray<unknown>): Promise<ImmutableArray<X>> {
		return this._sql(strings, ...values);
	}

	/**
	 * Build an SQL fragment for an identifier, escaped via `Bun.SQL`'s `sql()` helper.
	 *
	 * Overrides the base implementation because the Bun SQL engine supports first-class identifier wrapping, which is more secure than manual quoting.
	 *
	 * @param name The identifier (table or column name) to escape.
	 * @returns An [`SQLFragment`](/db/SQLFragment) wrapping the escaped identifier.
	 * @example provider.sqlIdentifier("items")
	 * @see https://dhoulb.github.io/shelving/bun/BunPostgreSQLProvider/BunPostgreSQLProvider/sqlIdentifier
	 */
	override sqlIdentifier(name: string): SQLFragment {
		return this.sql`${this._sql(name)}`;
	}
}

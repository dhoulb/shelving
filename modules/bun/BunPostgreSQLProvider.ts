import type { SQL } from "bun";
import { PostgreSQLProvider, type SQLFragment } from "../db/index.js";
import type { ImmutableArray } from "../util/array.js";
import type { Data } from "../util/data.js";
import type { Identifier } from "../util/item.js";

/**
 * PostgreSQL database provider backed by Bun's built-in `Bun.SQL` driver.
 *
 * Implements the `PostgreSQLProvider` SQL abstraction by executing tagged-template queries against a `Bun.SQL` connection.
 * - Identifiers are escaped through `Bun.SQL`'s own `sql()` helper rather than naive string quoting, which is more secure.
 * - Requires the `bun` peer dependency and a running Bun environment.
 *
 * @see https://shelving.cc/bun/BunPostgreSQLProvider
 */
export class BunPostgreSQLProvider<I extends Identifier = Identifier, T extends Data = Data> extends PostgreSQLProvider<I, T> {
	private _sql: SQL;

	constructor(sql: SQL) {
		super();
		this._sql = sql;
	}

	override exec<X extends Data>(strings: TemplateStringsArray, ...values: ImmutableArray<unknown>): Promise<ImmutableArray<X>> {
		return this._sql(strings, ...values);
	}

	/** Escapes the identifier via `Bun.SQL`'s first-class `sql()` wrapping rather than manual quoting, which is more secure. */
	override sqlIdentifier(name: string): SQLFragment {
		return this.sql`${this._sql(name)}`;
	}
}

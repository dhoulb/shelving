import type { SQL } from "bun";
import { PostgreSQLProvider, type SQLFragment } from "../db/index.js";
import type { ImmutableArray } from "../util/array.js";
import type { Data } from "../util/data.js";

export class BunPostgreSQLProvider extends PostgreSQLProvider {
	private _sql: SQL;

	constructor(sql: SQL) {
		super();
		this._sql = sql;
	}

	// Implement `SQLProvider` using `Bun.SQL` instance.
	exec<T extends Data>(strings: TemplateStringsArray, ...values: ImmutableArray<unknown>): Promise<ImmutableArray<T>> {
		return this._sql(strings, ...values);
	}

	// Override to wrap identifiers using `sql()`, since Bun SQL engine supports this and it's more secure.
	override sqlIdentifier(name: string): SQLFragment {
		return this.sql`${this._sql(name)}`;
	}
}

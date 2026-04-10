import type { SQL } from "bun";
import { PostgreSQLProvider, type SQLFragment } from "../db/index.js";
import type { ImmutableArray } from "../util/array.js";
import type { Data } from "../util/data.js";
import type { Identifier } from "../util/item.js";

export class BunPostgreSQLProvider<I extends Identifier = Identifier, T extends Data = Data> extends PostgreSQLProvider<I, T> {
	private _sql: SQL;

	constructor(sql: SQL) {
		super();
		this._sql = sql;
	}

	// Implement `SQLProvider` using `Bun.SQL` instance.
	exec<X extends Data>(strings: TemplateStringsArray, ...values: ImmutableArray<unknown>): Promise<ImmutableArray<X>> {
		return this._sql(strings, ...values);
	}

	// Override to wrap identifiers using `sql()`, since Bun SQL engine supports this and it's more secure.
	override sqlIdentifier(name: string): SQLFragment {
		return this.sql`${this._sql(name)}`;
	}
}

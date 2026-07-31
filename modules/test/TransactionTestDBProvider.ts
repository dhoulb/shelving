import type { DBProvider } from "../db/provider/DBProvider.js";
import { MemoryDBProvider } from "../db/provider/MemoryDBProvider.js";
import type { Data } from "../util/data.js";
import type { Identifier } from "../util/item.js";

/**
 * In-memory provider for testing wrapping providers' `transact()` — runs the callback directly against itself.
 *
 * - No atomicity or rollback: writes apply immediately and are kept even if the callback throws.
 * - Use it as the `source` of a wrapping provider to test how the wrapper behaves inside transactions, not to test transaction semantics themselves.
 *
 * @see https://shelving.cc/test/TransactionTestDBProvider
 */
export class TransactionTestDBProvider<I extends Identifier = Identifier, T extends Data = Data> extends MemoryDBProvider<I, T> {
	override async transact<X>(callback: (provider: DBProvider<I, T>) => Promise<X>): Promise<X> {
		return await callback(this);
	}
}

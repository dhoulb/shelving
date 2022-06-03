import type { Data, Entity } from "../util/data.js";
import { ConditionError } from "../error/ConditionError.js";
import { BooleanState } from "../stream/BooleanState.js";
import { getLastItem } from "../util/array.js";
import { assertMax, assertNumber } from "../util/number.js";
import { ArrayState } from "../stream/ArrayState.js";
import { QueryReference } from "./Reference.js";

/**
 * State that wraps a `Documents` reference to enable pagination.
 * - If you pass in initial values, it will use that as the first page.
 * - If you don't pass in initial values, it will autoload the first page.
 */
export class PaginationState<T extends Data> extends ArrayState<Entity<T>> {
	/** Whether this pagination is currently loading results. */
	readonly busy = new BooleanState();

	/** Reference to the query this pagination is paginating. */
	readonly ref: QueryReference<T>;

	/** Limit set on this pagination's query. */
	readonly limit: number;

	constructor(ref: QueryReference<T>) {
		super();
		this.ref = ref;
		assertNumber(ref.limit); // Collection must have a numeric limit to paginate (otherwise you'd be retrieving the entire set of documents).
		assertMax(ref.sorts.size, 1); // Collection must have at least one sort order to paginate.
		this.limit = ref.limit;
	}

	/**
	 * Load more results after the end.
	 * - Promise that needs to be handled.
	 */
	more = async (): Promise<void> => {
		if (this.closed) throw new ConditionError("Pagination is closed");
		if (!this.busy.value) {
			this.busy.next(true);
			if (!this.exists) {
				// First set of results.
				const next = await this.ref.array;
				this.next(next);
				if (next.length < this.limit) this.complete();
				this.busy.next(false);
			} else {
				// Additional set of results.
				const lastItem = getLastItem(this.value);
				if (lastItem) {
					const next = await this.ref.after(lastItem).array;
					this.merge(next);
					if (next.length < this.limit) this.complete();
					this.busy.next(false);
					return;
				}
			}
		}
	};

	/**
	 * Merge more results into this pagination.
	 * @return The change in the number of results.
	 */
	merge(more: Iterable<Entity<T>>): void {
		this.next(this.exists ? [...this.value, ...more] : [...more]);
	}
}

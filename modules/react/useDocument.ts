import type { Unsubscribe } from "../observe/Observable.js";
import type { DocumentReference } from "../db/Reference.js";
import type { Data, OptionalEntity } from "../util/data.js";
import { getDocumentData, isSameReference } from "../db/Reference.js";
import { CacheProvider } from "../provider/CacheProvider.js";
import { findSourceProvider } from "../provider/ThroughProvider.js";
import { Entity } from "../util/data.js";
import { State } from "../state/State.js";
import { MemoryTable } from "../provider/MemoryProvider.js";
import { MatchObserver } from "../observe/MatchObserver.js";
import { BooleanState } from "../state/BooleanState.js";
import { ConditionError } from "../error/ConditionError.js";
import { dispatch } from "../util/function.js";
import { useReduce } from "./useReduce.js";
import { useSubscribe } from "./useSubscribe.js";

/** Hold the current state of a document. */
export class DocumentState<T extends Data> extends State<OptionalEntity<T>> {
	readonly ref: DocumentReference<T>;
	readonly busy = new BooleanState();
	protected readonly _table: MemoryTable<T>;

	/** Time this state was last updated with a new value. */
	get time(): number | undefined {
		return this._table.getDocumentTime(this.ref.id);
	}

	/** How old this state's value is (in milliseconds). */
	get age(): number {
		const time = this.time;
		return typeof time === "number" ? Date.now() - time : Infinity;
	}

	get data(): Entity<T> {
		return getDocumentData(this.value, this.ref);
	}

	constructor(ref: DocumentReference<T>) {
		super();
		this._table = findSourceProvider(ref.db.provider, CacheProvider).memory.getTable(ref);
		this.ref = ref;

		// If the result is cached use it as the initial value.
		const isCached = this._table.getDocumentTime(ref.id) !== undefined;
		if (isCached) this.next(this._table.getDocument(ref.id)); // Use the existing cached value.
		else dispatch(this.refresh); // Queue a request to refresh the value.
	}

	/** Refresh this state from the source provider. */
	async refresh() {
		if (this.closed) throw new ConditionError("State is closed");
		if (!this.busy.value) {
			try {
				this.busy.next(true);
				const result = await this.ref.value;
				this.busy.next(false);
				this.next(result);
			} catch (thrown) {
				this.error(thrown);
			}
		}
	}

	/** Refresh this state if data in the cache is older than `maxAge` (in milliseconds). */
	refreshStale(maxAge: number) {
		if (this.age > maxAge) dispatch(this.refresh);
	}

	/** Subscribe this state to the source provider. */
	connectSource(): Unsubscribe {
		return this.connect(() => this.ref.subscribe({}));
	}

	// Override to subscribe to the cache when an observer is added.
	protected override _addFirstObserver(): void {
		// Connect this state to the source.
		// Connect through a `MatchObserver` that only dispatches `next()` if the document is actually cached (it might just be `null` because no document has been cached yet).
		this.connect(() => this._table.subscribeDocument(this.ref.id, new MatchObserver(() => this._table.getDocumentTime(this.ref.id) !== undefined, this)));
	}

	// Override to unsubscribe from the cache when an observer is removed.
	protected override _removeLastObserver(): void {
		// Disconnect all sources.
		this.disconnect();
	}
}

/** Reuse the previous `DocumentState` or create a new one. */
const _getDocumentState = <T extends Data>(previous: DocumentState<T> | undefined, ref: DocumentReference<T> | undefined): DocumentState<T> | undefined =>
	!ref ? undefined : previous && isSameReference(previous.ref, ref) ? previous : new DocumentState(ref);

/**
 * Use a document in a React component.
 * - Use `useDocument(ref).data` to get the data of the document.
 * - Use `useDocument(ref).value` to get the data of the document or `null` if it doesn't exist.
 * - Use `useDocument(ref).exists` to check if the document is loaded before accessing `.data` or `.value`
 */
export function useDocument<T extends Data>(ref: DocumentReference<T>): DocumentState<T>;
export function useDocument<T extends Data>(ref?: DocumentReference<T>): DocumentState<T> | undefined;
export function useDocument<T extends Data>(ref?: DocumentReference<T>): DocumentState<T> | undefined {
	const state = useReduce<DocumentState<T> | undefined, [DocumentReference<T> | undefined]>(_getDocumentState, ref);
	useSubscribe(state);
	return state;
}

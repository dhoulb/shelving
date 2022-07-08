import type { Unsubscribe } from "../observe/Observable.js";
import type { DocumentReference } from "../db/Reference.js";
import type { Data, OptionalEntity, Entity } from "../util/data.js";
import { reduceMapItem } from "../util/map.js";
import { getDocumentData } from "../db/Reference.js";
import { CacheProvider } from "../provider/CacheProvider.js";
import { findSourceProvider } from "../provider/ThroughProvider.js";
import { State } from "../state/State.js";
import { BooleanState } from "../state/BooleanState.js";
import { ConditionError } from "../error/ConditionError.js";
import { NOVALUE } from "../util/constants.js";
import { useSubscribe } from "./useSubscribe.js";
import { useCache } from "./useCache.js";

/** Hold the current state of a document. */
export class DocumentState<T extends Data> extends State<OptionalEntity<T>> {
	readonly ref: DocumentReference<T>;
	readonly busy = new BooleanState();

	/** Get the data of the document (throws `RequiredError` if document doesn't exist). */
	get data(): Entity<T> {
		return getDocumentData(this.value, this.ref);
	}

	/** Does the document exist (i.e. its value isn't `null`)? */
	get exists(): boolean {
		return !!this.value;
	}

	constructor(ref: DocumentReference<T>) {
		const table = findSourceProvider(ref.db.provider, CacheProvider)?.memory.getTable(ref);
		const time = table ? table.getDocumentTime(ref.id) : null;
		const isCached = typeof time === "number";
		super(table && isCached ? table.getDocument(ref.id) : NOVALUE);
		this._time = time;
		this.ref = ref;

		// Queue a request to refresh the value if it doesn't exist.
		if (this.loading) void this.refresh();
	}

	/** Refresh this state from the source provider. */
	readonly refresh = async () => {
		if (this.closed) throw new ConditionError("State is closed");
		if (!this.busy.value) {
			this.busy.next(true);
			try {
				const result = await this.ref.value;
				this.next(result);
			} catch (thrown) {
				this.error(thrown);
			} finally {
				this.busy.next(false);
			}
		}
	};

	/** Refresh this state if data in the cache is older than `maxAge` (in milliseconds). */
	refreshStale(maxAge: number) {
		if (this.age > maxAge) void this.refresh();
	}

	/** Subscribe this state to the source provider. */
	connectSource(): Unsubscribe {
		return this.connect(() => this.ref.subscribe({}));
	}

	/** Subscribe this state to any `CacheProvider` that exists in the provider chain. */
	connectCache(): Unsubscribe | void {
		const table = findSourceProvider(this.ref.db.provider, CacheProvider)?.memory.getTable(this.ref);
		table && this.connect(() => table.subscribeCachedDocument(this.ref.id, this));
	}

	// Override to subscribe to the cache when an observer is added.
	protected override _addFirstObserver(): void {
		this.connectCache();
	}

	// Override to unsubscribe from the cache when an observer is removed.
	protected override _removeLastObserver(): void {
		// Disconnect all sources.
		this.disconnect();
	}
}

/** Reuse the previous `DocumentState` or create a new one. */
const _reduceDocumentState = <T extends Data>(existing: DocumentState<T> | undefined, ref: DocumentReference<T>): DocumentState<T> => existing || new DocumentState(ref);

/**
 * Use a document in a React component.
 * - Uses the default cache, so will error if not used inside `<Cache>`
 */
export function useDocument<T extends Data>(ref: DocumentReference<T>): DocumentState<T>;
export function useDocument<T extends Data>(ref?: DocumentReference<T>): DocumentState<T> | undefined;
export function useDocument<T extends Data>(ref?: DocumentReference<T>): DocumentState<T> | undefined {
	const cache = useCache();
	const state = ref ? reduceMapItem(cache, ref.toString(), _reduceDocumentState, ref) : undefined;
	useSubscribe(state);
	return state;
}

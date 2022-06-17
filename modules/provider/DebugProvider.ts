/* eslint-disable no-console */

import type { Data, Result, Entity } from "../util/data.js";
import type { DocumentReference, QueryReference } from "../db/Reference.js";
import type { DataUpdate } from "../update/DataUpdate.js";
import { Observer, ThroughObserver, Unsubscriber } from "../util/observe.js";
import { isAsync } from "../util/async.js";
import { ThroughProvider } from "./ThroughProvider.js";

/** Provider that logs its operations to the console for debugging purposes. */
export class DebugProvider extends ThroughProvider {
	override get<T extends Data>(ref: DocumentReference<T>): Result<Entity<T>> | PromiseLike<Result<Entity<T>>> {
		console.log(`Get "${ref}"`);
		try {
			const result = super.get(ref);
			return isAsync(result)
				? result.then(undefined, reason => {
						console.error(`Error getting "${ref}"`, reason);
						throw reason;
				  })
				: result;
		} catch (reason) {
			console.error(`Error getting "${ref}"`, reason);
			throw reason;
		}
	}
	override subscribe<T extends Data>(ref: DocumentReference<T>, observer: Observer<Result<Entity<T>>>): Unsubscriber {
		console.log(`Subscribe "${ref}"`);
		return super.subscribe(ref, new DatabaseDebugObserver(ref, observer));
	}
	override add<T extends Data>(ref: QueryReference<T>, data: T): string | PromiseLike<string> {
		console.log(`Add to "${ref}"`, data);
		try {
			const result = super.add(ref, data);
			return isAsync(result)
				? result.then(undefined, reason => {
						console.error(`Error adding to "${ref}"`, reason);
						throw reason;
				  })
				: result;
		} catch (reason) {
			console.error(`Error adding to "${ref}"`, reason);
			throw reason;
		}
	}
	override set<T extends Data>(ref: DocumentReference<T>, data: T): void | PromiseLike<void> {
		console.log(`Set "${ref}"`, data);
		try {
			const result = super.set(ref, data);
			return isAsync(result)
				? result.then(undefined, reason => {
						console.error(`Error setting "${ref}"`, reason);
						throw reason;
				  })
				: result;
		} catch (reason) {
			console.error(`Error setting "${ref}"`, reason);
			throw reason;
		}
	}
	override update<T extends Data>(ref: DocumentReference<T>, update: DataUpdate<T>): void | PromiseLike<void> {
		console.log(`Update "${ref}"`, update.updates);
		try {
			const result = super.update(ref, update);
			return isAsync(result)
				? result.then(undefined, reason => {
						console.error(`Error updating "${ref}"`, reason);
						throw reason;
				  })
				: result;
		} catch (reason) {
			console.error(`Error updating "${ref}"`, reason);
			throw reason;
		}
	}
	override delete<T extends Data>(ref: DocumentReference<T>): void | PromiseLike<void> {
		console.log(`Delete "${ref}"`);
		try {
			const result = super.delete(ref);
			return isAsync(result)
				? result.then(undefined, reason => {
						console.error(`Error deleting "${ref}"`, reason);
						throw reason;
				  })
				: result;
		} catch (reason) {
			console.error(`Error deleting "${ref}"`, reason);
			throw reason;
		}
	}
	override getQuery<T extends Data>(ref: QueryReference<T>): Iterable<Entity<T>> | PromiseLike<Iterable<Entity<T>>> {
		console.log(`Get "${ref}"`);
		try {
			const results = super.getQuery(ref);
			return isAsync(results)
				? results.then(undefined, reason => {
						console.error(`Error getting "${ref}"`, reason);
						throw reason;
				  })
				: results;
		} catch (reason) {
			console.error(`Error getting "${ref}"`, reason);
			throw reason;
		}
	}
	override subscribeQuery<T extends Data>(ref: QueryReference<T>, observer: Observer<Iterable<Entity<T>>>): Unsubscriber {
		console.log(`Subscribe "${ref}"`);
		return super.subscribeQuery(ref, new DatabaseDebugObserver(ref, observer));
	}
	override setQuery<T extends Data>(ref: QueryReference<T>, data: T): number | PromiseLike<number> {
		console.log(`Set "${ref}"`, data);
		try {
			const result = super.setQuery(ref, data);
			return isAsync(result)
				? result.then(undefined, reason => {
						console.error(`Error setting "${ref}"`, reason);
						throw reason;
				  })
				: result;
		} catch (reason) {
			console.error(`Error setting "${ref}"`, reason);
			throw reason;
		}
	}
	override updateQuery<T extends Data>(ref: QueryReference<T>, update: DataUpdate<T>): number | PromiseLike<number> {
		console.log(`Update "${ref}"`, update.updates);
		try {
			const result = super.updateQuery(ref, update);
			return isAsync(result)
				? result.then(undefined, reason => {
						console.error(`Error updating "${ref}"`, reason);
						throw reason;
				  })
				: result;
		} catch (reason) {
			console.error(`Error updating "${ref}"`, reason);
			throw reason;
		}
	}
	override deleteQuery<T extends Data>(ref: QueryReference<T>): number | PromiseLike<number> {
		console.log(`Delete "${ref}"`);
		try {
			const result = super.deleteQuery(ref);
			return isAsync(result)
				? result.then(undefined, reason => {
						console.error(`Error writing "${ref}"`, reason);
						throw reason;
				  })
				: result;
		} catch (reason) {
			console.error(`Error writing "${ref}"`, reason);
			throw reason;
		}
	}
}

/** Observer that wraps errors in subscriptions in `ReferenceReadError` */
class DatabaseDebugObserver<T extends Data, U extends Result<Entity<T>> | Iterable<Entity<T>>> extends ThroughObserver<U> {
	readonly ref: DocumentReference<T> | QueryReference<T>;
	constructor(ref: DocumentReference<T> | QueryReference<T>, target: Observer<U>) {
		super(target);
		this.ref = ref;
	}
	override error(reason: Error | unknown): void {
		console.log(`Error in subscription to ${this.ref}`, reason);
		super.error(reason);
	}
}

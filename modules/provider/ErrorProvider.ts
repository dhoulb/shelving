import { DatabaseDocument, DatabaseQuery } from "../db/Database.js";
import { isAsync } from "../index.js";
import { Update } from "../update/Update.js";
import { Data, Result } from "../util/data.js";
import { Entries } from "../util/entry.js";
import { Observer, ThroughObserver, Unsubscriber } from "../util/observable.js";
import { ThroughProvider } from "./ThroughProvider.js";

/** Provider that wraps errors thrown from deeper providers in `DatabaseReadError` and `DatabaseWriteError` etc to make it easier to see what read/write caused the error. */
export class ErrorProvider extends ThroughProvider {
	override get<T extends Data>(ref: DatabaseDocument<T>): Result<T> | PromiseLike<Result<T>> {
		try {
			const result = super.get(ref);
			return isAsync(result)
				? result.then(undefined, err => {
						throw err instanceof Error ? new DatabaseReadError(err, ref) : err;
				  })
				: result;
		} catch (err: unknown) {
			if (err instanceof Error) throw new DatabaseReadError(err, ref);
			throw err;
		}
	}
	override subscribe<T extends Data>(ref: DatabaseDocument<T>, observer: Observer<Result<T>>): Unsubscriber {
		return super.subscribe(ref, new DatabaseErrorObserver(ref, observer));
	}
	override add<T extends Data>(ref: DatabaseQuery<T>, data: T): string | PromiseLike<string> {
		try {
			const result = super.add(ref, data);
			return isAsync(result)
				? result.then(undefined, err => {
						throw err instanceof Error ? new DatabaseWriteError(err, ref) : err;
				  })
				: result;
		} catch (err: unknown) {
			if (err instanceof Error) throw new DatabaseWriteError(err, ref);
			throw err;
		}
	}
	override set<T extends Data>(ref: DatabaseDocument<T>, data: T): void | PromiseLike<void> {
		try {
			const result = super.set(ref, data);
			return isAsync(result)
				? result.then(undefined, err => {
						throw err instanceof Error ? new DatabaseWriteError(err, ref) : err;
				  })
				: result;
		} catch (err: unknown) {
			if (err instanceof Error) throw new DatabaseWriteError(err, ref);
			throw err;
		}
	}
	override update<T extends Data>(ref: DatabaseDocument<T>, updates: Update<T>): void | PromiseLike<void> {
		try {
			const result = super.update(ref, updates);
			return isAsync(result)
				? result.then(undefined, err => {
						throw err instanceof Error ? new DatabaseWriteError(err, ref) : err;
				  })
				: result;
		} catch (err: unknown) {
			if (err instanceof Error) throw new DatabaseWriteError(err, ref);
			throw err;
		}
	}
	override delete<T extends Data>(ref: DatabaseDocument<T>): void | PromiseLike<void> {
		try {
			const result = super.delete(ref);
			return isAsync(result)
				? result.then(undefined, err => {
						throw err instanceof Error ? new DatabaseWriteError(err, ref) : err;
				  })
				: result;
		} catch (err: unknown) {
			if (err instanceof Error) throw new DatabaseWriteError(err, ref);
			throw err;
		}
	}
	override getQuery<T extends Data>(ref: DatabaseQuery<T>): Entries<T> | PromiseLike<Entries<T>> {
		try {
			const results = super.getQuery(ref);
			return isAsync(results)
				? results.then(undefined, err => {
						throw err instanceof Error ? new DatabaseReadError(err, ref) : err;
				  })
				: results;
		} catch (err: unknown) {
			if (err instanceof Error) throw new DatabaseReadError(err, ref);
			throw err;
		}
	}
	override subscribeQuery<T extends Data>(ref: DatabaseQuery<T>, observer: Observer<Entries<T>>): Unsubscriber {
		return super.subscribeQuery(ref, new DatabaseErrorObserver(ref, observer));
	}
	override setQuery<T extends Data>(ref: DatabaseQuery<T>, data: T): number | PromiseLike<number> {
		try {
			const result = super.setQuery(ref, data);
			return isAsync(result)
				? result.then(undefined, err => {
						throw err instanceof Error ? new DatabaseWriteError(err, ref) : err;
				  })
				: result;
		} catch (err: unknown) {
			if (err instanceof Error) throw new DatabaseWriteError(err, ref);
			throw err;
		}
	}
	override updateQuery<T extends Data>(ref: DatabaseQuery<T>, updates: Update<T>): number | PromiseLike<number> {
		try {
			const result = super.updateQuery(ref, updates);
			return isAsync(result)
				? result.then(undefined, err => {
						throw err instanceof Error ? new DatabaseWriteError(err, ref) : err;
				  })
				: result;
		} catch (err: unknown) {
			if (err instanceof Error) throw new DatabaseWriteError(err, ref);
			throw err;
		}
	}
	override deleteQuery<T extends Data>(ref: DatabaseQuery<T>): number | PromiseLike<number> {
		try {
			const result = super.deleteQuery(ref);
			return isAsync(result)
				? result.then(undefined, err => {
						throw err instanceof Error ? new DatabaseWriteError(err, ref) : err;
				  })
				: result;
		} catch (err: unknown) {
			if (err instanceof Error) throw new DatabaseWriteError(err, ref);
			throw err;
		}
	}
}

/** Thrown if an error occurs while reading a query. */
export class DatabaseReadError<T extends Data> extends Error {
	readonly error: Error;
	readonly ref: DatabaseDocument<T> | DatabaseQuery<T>;
	constructor(error: Error, ref: DatabaseDocument<T> | DatabaseQuery<T>) {
		super(`Error reading ${ref.toString()}:\n${error.message}`);
		this.error = error;
		this.ref = ref;
	}
}
DatabaseReadError.prototype.name = "DatabaseReadError";

/** Thrown if an error occurs while writing a document. */
export class DatabaseWriteError<T extends Data> extends Error {
	readonly error: Error;
	readonly ref: DatabaseDocument<T> | DatabaseQuery<T>;
	constructor(error: Error, ref: DatabaseDocument<T> | DatabaseQuery<T>) {
		super(`Error writing ${ref.toString()}:\n${error.message}`);
		this.error = error;
		this.ref = ref;
	}
}
DatabaseWriteError.prototype.name = "DatabaseWriteError";

/** Observer that wraps errors in subscriptions in `DatabaseReadError` */
class DatabaseErrorObserver<T extends Data, U extends Result<T> | Entries<T>> extends ThroughObserver<U> {
	readonly ref: DatabaseDocument<T> | DatabaseQuery<T>;
	constructor(ref: DatabaseDocument<T> | DatabaseQuery<T>, target: Observer<U>) {
		super(target);
		this.ref = ref;
	}
	override error(error: Error | unknown): void {
		super.error(error instanceof Error ? new DatabaseReadError(error, this.ref) : error);
	}
}
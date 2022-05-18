import type { DocumentReference, QueryReference } from "../db/index.js";
import { Data, Result, Unsubscriber, Observer, validate, ValidateObserver, Entries, callAsync, validateResult } from "../util/index.js";
import { DataUpdate, validateUpdate } from "../update/index.js";
import { ThroughProvider } from "./ThroughProvider.js";

/** Validates any values that are read from or written to a source provider. */
export class ValidationProvider extends ThroughProvider {
	override get<T extends Data>(ref: DocumentReference<T>): Result<T> | PromiseLike<Result<T>> {
		return callAsync(validateResult, super.get(ref), ref);
	}
	override subscribe<T extends Data>(ref: DocumentReference<T>, observer: Observer<Result>): Unsubscriber {
		return super.subscribe(ref, new ValidateObserver(ref, observer));
	}
	override add<T extends Data>(ref: QueryReference<T>, data: T): string | PromiseLike<string> {
		return super.add(ref, validate(data, ref.validator));
	}
	override set<T extends Data>(ref: DocumentReference<T>, value: T): void | PromiseLike<void> {
		return super.set(ref, validate(value, ref.validator));
	}
	override update<T extends Data>(ref: DocumentReference<T>, update: DataUpdate<T>): void | PromiseLike<void> {
		return super.update<T>(ref, validateUpdate(update, ref.validator));
	}
	override getQuery<T extends Data>(ref: QueryReference<T>): Entries<T> | PromiseLike<Entries<T>> {
		return callAsync(validate, super.getQuery(ref), ref);
	}
	override subscribeQuery<T extends Data>(ref: QueryReference<T>, observer: Observer<Entries<T>>): Unsubscriber {
		return super.subscribeQuery(ref, new ValidateObserver(ref, observer));
	}
	override setQuery<T extends Data>(ref: QueryReference<T>, value: T): number | PromiseLike<number> {
		return super.setQuery(ref, validate(value, ref.validator));
	}
	override updateQuery<T extends Data>(ref: QueryReference<T>, update: DataUpdate<T>): number | PromiseLike<number> {
		return super.updateQuery(ref, validateUpdate(update, ref.validator));
	}
}

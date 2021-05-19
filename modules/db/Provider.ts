import type { Data, Result, Results } from "../data";
import type { Unsubscriber } from "../function";
import type { Stream } from "../stream";
import type { Document } from "./Document";
import type { Documents } from "./Documents";

/**
 * Provider interface: Implemented by classes that provide access to data (e.g. IndexedDB, Firebase, or in-memory cache providers).
 */
export interface Provider {
	/**
	 * Whether results from this provider need to be validated when read.
	 * - i.e. results from `MemoryProvider` don't need validation because they were validated when they were written and can't be modified in memory.
	 */
	readonly VALIDATE: boolean;

	/**
	 * Get a document.
	 *
	 * @param ref Document specifying which document to get.
	 * @return The document object, or `undefined` if it doesn't exist.
	 */
	getDocument(ref: Document): Result | Promise<Result>;

	/**
	 * Subscribe to a document.
	 * - Expect that `onNext()` is called immediately with the initial value.
	 *
	 * @param ref Document specifying which document to subscribe to.
	 * @param stream Stream to report the result back to.
	 * @return Function that unsubscribes the subscription listener.
	 */
	onDocument(ref: Document, stream: Stream<Result>): Unsubscriber;

	/**
	 * Create a new document in a collection by generating a unique ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param ref Which collection to add the document to.
	 * @return Promise that resolves to the string ID of the created document when done.
	 */
	addDocument(ref: Documents, data: Data): string | Promise<string>;

	/**
	 * Set a document.
	 * - If the document exists, set the value of it.
	 * - If the document doesn't exist, set it at path.
	 *
	 * @param ref Document specifying which document to merge into.
	 * @param change The change to update the document (either a diff to update the value, or `undefined` for delete).
	 *
	 * @return Promise that resolves when done.
	 * @throws RequiredError if the document doesn't exist.
	 */
	setDocument(ref: Document, data: Data): void | Promise<void>;

	/**
	 * Update an existing document with a partial value.
	 * - If the document exists, merge the new value into it (deeply).
	 * - If the document doesn't exist, throw an error.
	 *
	 * @param ref Document specifying which document to merge into.
	 * @param partial Set of updates to make to the document.
	 *
	 * @return Promise that resolves when done.
	 * @throws RequiredError if the document doesn't exist.
	 */
	updateDocument(ref: Document, partial: Data): void | Promise<void>;

	/**
	 * Delete a document.
	 *
	 * @param ref Document specifying which document document to delete.
	 * @return Promise that resolves when done.
	 */
	deleteDocument(ref: Document): void | Promise<void>;

	/**
	 * Count all matching documents.
	 * - This is implemented separately to `getDocuments()` because sometimes counting is significantly more efficient than reading every document.
	 *
	 * @param ref Which collection to count documents from.
	 * @return Array of documents matching the rules.
	 */
	countDocuments(ref: Documents): number | Promise<number>;

	/**
	 * Get all matching documents.
	 *
	 * @param ref Which collection to get documents from.
	 * @return Array of documents matching the rules.
	 */
	getDocuments(ref: Documents): Results | Promise<Results>;

	/**
	 * Subscribe to all matching documents.
	 * - Expect that `onNext()` is called immediately with the initial value.
	 *
	 * @param ref Which collection to to subscribe to.
	 * @param stream Stream to report the results back to.
	 * @return Function that unsubscribes the subscription listener.
	 */
	onDocuments(ref: Documents, stream: Stream<Results>): Unsubscriber;

	/**
	 * Set all matching documents to the same value.
	 *
	 * @param ref Which collection to set.
	 * @return Promise that resolves when done.
	 */
	setDocuments(ref: Documents, data: Data): void | Promise<void>;

	/**
	 * Update all matching documents with the same partial value.
	 *
	 * @param ref Which collection to update.
	 * @return Promise that resolves when done.
	 */
	updateDocuments(ref: Documents, partial: Data): void | Promise<void>;

	/**
	 * Delete all matching documents.
	 *
	 * @param ref Which collection to delete.
	 * @return Promise that resolves when done.
	 */
	deleteDocuments(ref: Documents): void | Promise<void>;
}

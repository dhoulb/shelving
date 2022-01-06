import { Database } from "../db/Database.js";
import { WriteOperation } from "./WriteOperation.js";

/** Represent a delete operation made to a single document in a database. */
export class DeleteOperation extends WriteOperation {
	readonly collection: string;
	readonly id: string;
	constructor(collection: string, id: string) {
		super();
		this.collection = collection;
		this.id = id;
	}
	async run(db: Database): Promise<this> {
		await db.doc(this.collection, this.id).delete();
		return this;
	}
}

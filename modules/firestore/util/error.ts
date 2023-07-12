import { ConnectionError } from "../../error/ConnectionError.js";
import { PermissionError } from "../../error/PermissionError.js";
import { RequiredError } from "../../error/RequiredError.js";
import { isObject } from "../../util/object.js";

/** Convert a Firestore error (which use gRPC error codes) into a corresponding Shelving error. */
export function convertFirestoreError(thrown: unknown): never {
	if (isObject(thrown)) {
		const code = thrown.code;
		if (typeof code === "string") {
			if (code === "unavailable") throw new ConnectionError();
			if (code === "not-found") throw new RequiredError();
			if (code === "permission-denied") throw new PermissionError();
		}
	}
	throw thrown;
}

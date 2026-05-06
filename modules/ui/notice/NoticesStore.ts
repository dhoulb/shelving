import type { ReactNode } from "react";
import { ArrayStore } from "../../store/ArrayStore.js";
import { awaitDispose } from "../../util/dispose.js";
import { NoticeStore } from "./NoticeStore.js";
import type { Status } from "./Status.js";

/** Store a list of notices. */
export class NoticesStore<S extends string> extends ArrayStore<NoticeStore<S>> {
	/** Show a notice with an optional status. */
	show(children?: ReactNode | undefined, status?: S | undefined): NoticeStore<S> {
		return new NoticeStore(this, children, status);
	}

	override async [Symbol.asyncDispose]() {
		await awaitDispose(
			...this.value, // Dispose all notices when we dispose.
			super[Symbol.asyncDispose](),
		);
	}
}

/** Create a global list of shown notices allowing any of the default statuses. */
export const NOTICES = new NoticesStore<Status>();

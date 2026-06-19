import type { ReactNode } from "react";
import { ArrayStore } from "../../store/ArrayStore.js";
import { awaitDispose } from "../../util/dispose.js";
import type { Status } from "../style/Status.js";
import { NoticeStore } from "./NoticeStore.js";

/**
 * Store holding the live list of `NoticeStore` notices currently shown.
 *
 * - Disposing the store disposes (and closes) every notice it contains.
 *
 * @example const notices = new NoticesStore(); notices.show("Hello");
 * @see https://dhoulb.github.io/shelving/ui/notice/NoticesStore/NoticesStore
 */
export class NoticesStore<S extends string> extends ArrayStore<NoticeStore<S>> {
	/**
	 * Create and show a new notice, adding it to this list.
	 *
	 * @param children The notice content (optional).
	 * @param status The notice status (optional).
	 * @returns The newly created `NoticeStore`.
	 * @example notices.show("Saved your changes", "success");
	 * @see https://dhoulb.github.io/shelving/ui/notice/NoticesStore/NoticesStore/show
	 */
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

/**
 * Global `NoticesStore` shown by `<Notices>`, accepting any of the default statuses.
 *
 * @example NOTICES.show("Saved your changes", "success");
 * @see https://dhoulb.github.io/shelving/ui/notice/NoticesStore/NOTICES
 */
export const NOTICES = new NoticesStore<Status>();

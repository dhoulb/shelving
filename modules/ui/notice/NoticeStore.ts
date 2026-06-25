import type { ReactNode } from "react";
import { DataStore } from "../../store/DataStore.js";
import { SECOND } from "../../util/constants.js";
import { awaitDispose } from "../../util/dispose.js";
import { getRandomKey } from "../../util/random.js";
import { Timeout } from "../../util/timeout.js";
import type { NoticesStore } from "./NoticesStore.js";

// Constants.
const TEMPORARY_NOTICE_MS = 5 * SECOND; // How long before notices hide themselves.

type NoticeData<S extends string> = {
	readonly status?: S | undefined;
	readonly children?: ReactNode | undefined;
};

/**
 * Store holding a single notice's content and status, owned by a `NoticesStore`.
 *
 * - Auto-closes itself a few seconds after opening unless its status is `"loading"`.
 * - Adds itself to its parent `NoticesStore` on construction and removes itself on `close()` or disposal.
 *
 * @example const notice = notices.show("Saved", "success"); notice.close();
 * @see https://shelving.cc/ui/NoticeStore
 */
export class NoticeStore<S extends string> extends DataStore<NoticeData<S>> {
	private _notices: NoticesStore<S>;

	readonly key = getRandomKey();

	constructor(notices: NoticesStore<S>, children?: ReactNode | null, status?: S | undefined) {
		super({ status, children });
		this._notices = notices;
		notices.add(this);
		this._autoclose();
	}

	/**
	 * Update the notice's content and status, resetting its auto-close timer.
	 *
	 * @param children The new notice content.
	 * @param status The new status (defaults to the current status).
	 * @example notice.show("Updating…", "loading");
	 * @see https://shelving.cc/ui/NoticeStore/show
	 */
	show(children?: ReactNode | undefined, status: S | undefined = this.value.status): void {
		this.value = { children, status };
	}

	/**
	 * Close this notice permanently, removing it from its parent `NoticesStore`.
	 *
	 * @example notice.close();
	 * @see https://shelving.cc/ui/NoticeStore/close
	 */
	close() {
		this._notices.delete(this);
	}

	// Override to automatically close this notice a few seconds after it's opened (after the user has had chance to read it).
	override write(data: NoticeData<S>): void {
		super.write(data);
		this._autoclose();
	}

	// Ping this to trigger auto-closing the notice.
	protected _autoclose(): void {
		const { status } = this.value;
		if (status !== "loading") this._timeout.set();
		else this._timeout.clear();
	}
	private _timeout = new Timeout(() => this.close(), TEMPORARY_NOTICE_MS);

	// Implement `AsyncDispose`
	override async [Symbol.asyncDispose]() {
		await awaitDispose(
			() => this.close(), // Remove self from parent when we dispose.
			super[Symbol.asyncDispose](),
		);
	}
}

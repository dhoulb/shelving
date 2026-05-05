import type { ReactNode } from "react";
import { awaitDispose, DataStore, getRandomKey, SECOND, Timeout } from "shelving";
import type { NoticesStore } from "./NoticesStore.js";

// Constants.
const TEMPORARY_NOTICE_MS = 5 * SECOND; // How long before notices hide themselves.

type NoticeData<S extends string> = {
	readonly status?: S | undefined;
	readonly children?: ReactNode | undefined;
};

/** Store a single notice. */
export class NoticeStore<S extends string> extends DataStore<NoticeData<S>> {
	private _notices: NoticesStore<S>;

	readonly key = getRandomKey();

	constructor(notices: NoticesStore<S>, children?: ReactNode | null, status?: S | undefined) {
		super({ status, children });
		this._notices = notices;
		notices.add(this);
		this._autoclose();
	}

	show(children?: ReactNode | undefined, status: S | undefined = this.value.status): void {
		this.value = { children, status };
	}

	/** Close this notice (permanently). */
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

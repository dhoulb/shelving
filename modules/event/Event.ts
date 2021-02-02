import { dispatch, AsyncDispatcher, UnsubscribeDispatcher, ErrorDispatcher } from "../dispatch";
import { addItem, deleteItem } from "../array";

/**
 * Listener can be either...
 * - An async dispatcher function (function or async function that receives the event value and returns void or void promise).
 * - Another `Event` instance (this allows events to be chained together).
 * - Any errors thrown or rejected in listeners will be caught and routed to `logError()`
 */
type Listener<T> = AsyncDispatcher<T> | Event<T>;

/** Options for an Event. */
type EventOptions = {
	/** Number of listeners to fire when `fire()` is called (i.e. `1` will only fire the 1 most recent listener). */
	fires?: number;
	/** Number of listeners to fire when `fire()` is called (i.e. `1` will only fire the 1 most recent listener). */
	onError?: ErrorDispatcher;
};

/**
 * Event: allows listener callback functions to be added and fired.
 * - Extends `Hookable` by making the protected `fire()` function public so anyone can
 * - All events can be async and will report any errors to `reportError()`
 */
export class Event<T> {
	/** List of all listener callback functions. */
	protected _ons: Listener<T>[] = [];

	/** List of listener callback functions that need to be removed after they're called once. */
	protected _ones: Listener<T>[] = [];

	/** Number of listeners to fire when `fire()` is called (i.e. `1` will only fire the 1 most recent listener). */
	protected _fires?: number;

	/** Error handler. */
	protected _onError?: ErrorDispatcher;

	constructor(options?: EventOptions) {
		this._fires = options?.fires;
		this._onError = options?.onError;
	}

	/**
	 * Attach a listener that fires indefinitely (until `off()` is called).
	 * Returns an unsubscribe function that can be called to remove the listener (equivalent to `off(listener)`).
	 */
	on(listener: Listener<T>): UnsubscribeDispatcher {
		addItem(this._ons, listener);
		return this.off.bind(this, listener);
	}

	/**
	 * Attach a listener that fires only once.
	 * Returns an unsubscribe function that can be called to remove the listener (equivalent to `off(listener)`).
	 */
	one(listener: Listener<T>): UnsubscribeDispatcher {
		addItem(this._ones, listener);
		return this.on(listener);
	}

	/** Detach a listener. */
	off(listener: Listener<T>): void {
		deleteItem(this._ons, listener);
		deleteItem(this._ones, listener);
	}

	/** Reset this listenable by removing all listeners. */
	reset(): void {
		this._ons.splice(0);
		this._ones.splice(0);
	}

	/**
	 * Fire attached listeners now.
	 * - Listeners are not called syncronously.
	 * - Errors thrown in listeners are reported to `reportError()`
	 */
	fire(value: T): void {
		const listeners = this._ons.slice(typeof this._fires === "number" ? 0 - this._fires : undefined);
		for (const listener of listeners) {
			// Delete this listener from the "once only" list.
			if (this._ones.includes(listener)) this.off(listener);
			// If it's another Hookable instance, call its `fire()` function.
			// If it's a simple callback function, call it safely.
			listener instanceof Event ? listener.fire(value) : dispatch(listener, value, this._onError);
		}
	}
}

/** Create a new Event instance. */
export const createEvent = <T>(options?: EventOptions): Event<T> => new Event<T>(options);

/**
 * Is an unknown value an `Event` instance?
 * - This is a TypeScript assertion function, so if this function returns `true` the type is also asserted to be a `Event`.
 */
export const isEvent = <T extends Event<unknown>>(event: T | unknown): event is T => event instanceof Event;

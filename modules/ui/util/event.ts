/**
 * Call `event.preventDefault()` on an event.
 *
 * - Handy as a ready-made event handler, e.g. `onSubmit={eventPreventDefault}`.
 *
 * @param e The event to suppress the default action of.
 * @example <form onSubmit={eventPreventDefault}>…</form>
 * @see https://shelving.cc/ui/eventPreventDefault
 */
export function eventPreventDefault(e: Pick<Event, "preventDefault">) {
	e.preventDefault();
}

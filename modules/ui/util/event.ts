/**
 * Call `event.preventDefault()` on an event.
 *
 * - Handy as a ready-made event handler, e.g. `onSubmit={eventPreventDefault}`.
 *
 * @param e The event to suppress the default action of.
 * @example <form onSubmit={eventPreventDefault}>…</form>
 * @see https://dhoulb.github.io/shelving/ui/util/event/eventPreventDefault
 */
export function eventPreventDefault(e: Pick<Event, "preventDefault">) {
	e.preventDefault();
}

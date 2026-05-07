/** Call `event.preventDefault()` on an event. */
export function eventPreventDefault(e: Pick<Event, "preventDefault">) {
	e.preventDefault();
}

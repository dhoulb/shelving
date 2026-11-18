import { type RefObject, useEffect, useRef } from "react";
import { BLACKHOLE } from "../../util/function.js";
import { TransitionScrub } from "./TransitionScrub.js";

/**
 * Which way the finger moves to complete a swipe.
 *
 * @see https://shelving.cc/ui/SwipeDirection
 */
export type SwipeDirection = "up" | "down" | "left" | "right";

/**
 * Options for `useSwipe()`.
 *
 * @see https://shelving.cc/ui/SwipeOptions
 */
export interface SwipeOptions {
	/** Which way the finger moves to complete the swipe. */
	readonly direction: SwipeDirection;
	/**
	 * Make the change that starts the view transition, for example close a dialog inside `startTransition()`.
	 * - Return `false` to start no swipe (for example when there is nothing to go back to).
	 */
	readonly start: () => unknown;
	/**
	 * Put back the state from before `start()`, when the swipe is cancelled.
	 * - Return a promise that resolves after React commits, so the transition ends on the right page.
	 */
	readonly cancel: () => PromiseLike<void> | void;
	/** Finish the change for real, after the slide reaches the end. */
	readonly commit?: (() => void) | undefined;
	/**
	 * Start only when the finger goes down this close to the screen edge it moves away from, in pixels (for example `24` for swipe-back).
	 * - Leave it out to start anywhere on the target.
	 */
	readonly edge?: number | undefined;
	/**
	 * Part of the target's size a slow drag must pass to complete.
	 *
	 * @default 0.35
	 */
	readonly distance?: number | undefined;
	/** Never start a swipe on an element inside one that matches this selector, for example `"nav"`. */
	readonly ignore?: string | undefined;
	/** Turn the swipe off. */
	readonly disabled?: boolean | undefined;
}

/** How far a finger moves before the swipe decides if it goes the right way, in pixels. */
const _SLOP = 8;

/** Speed of a flick that completes a swipe, in pixels per millisecond. */
const _FLICK = 0.4;

/** Elements whose own touch handling a swipe never takes over. */
const _FIELDS = "input, textarea, select, [contenteditable]";

/** The swipe that runs now, anywhere on the page. Only one swipe runs at a time. */
let _active = false;

/** A swipe in progress. */
interface _Gesture {
	readonly x: number;
	readonly y: number;
	readonly size: number;
	distance: number;
	time: number;
	speed: number;
	scrub: TransitionScrub | undefined;
}

/**
 * Swipe a target to complete a change, and scrub the change's view transition with the finger.
 *
 * - When the finger moves the right way, it calls `start()` and catches the view transition that starts, with `TransitionScrub`.
 * - While the finger moves, the transition follows it. Progress is the drag distance divided by the target's size in that direction (the screen size for `document`).
 * - On release, past `distance` or after a flick, it plays the transition to the end and calls `commit()`. Otherwise it plays it back and calls `cancel()`.
 * - It does not start when the finger is on a field, inside an element that can still scroll that way, or inside a `<dialog>` that does not hold the target.
 * - Only one swipe runs at a time. A swipe on `document` listens first, so an edge swipe wins over a swipe on an element below it.
 *
 * @param target The element to swipe, or `document` for the whole page.
 * @param options What the swipe does.
 * @see https://shelving.cc/ui/useSwipe
 */
export function useSwipe(target: RefObject<Element | null> | Document, options: SwipeOptions): void {
	const optionsRef = useRef(options);
	optionsRef.current = options;

	useEffect(() => {
		const el = _isDocument(target) ? target : target.current;
		if (!el) return;
		const capture = _isDocument(el);
		let gesture: _Gesture | undefined;
		let x = 0;
		let y = 0;
		let time = 0;
		let pending = false;
		// The touched element. It gets the move and end events even when the update takes it out of the page, so listen there.
		let node: EventTarget | undefined;
		const detach = () => {
			node?.removeEventListener("touchmove", onMove);
			node?.removeEventListener("touchend", onEnd);
			node?.removeEventListener("touchcancel", onEnd);
			document.removeEventListener("touchend", onEnd, true);
			document.removeEventListener("touchcancel", onEnd, true);
			node = undefined;
		};

		const onStart = (e: Event) => {
			const touch = (e as TouchEvent).touches[0];
			const { disabled, edge, direction, ignore } = optionsRef.current;
			pending = false;
			// A new touch while a swipe still runs means its end was lost: end it now, so it never stays stuck halfway.
			if (gesture) onEnd(e);
			if (disabled || _active || (e as TouchEvent).touches.length !== 1 || !touch) return;
			if (!(e.target instanceof Element) || e.target.closest(_FIELDS) || (ignore && e.target.closest(ignore))) return;
			// A touch inside a dialog never swipes something behind the dialog.
			if (e.target.closest("dialog") !== (capture ? null : (el as Element).closest("dialog"))) return;
			if (edge !== undefined && _getEdgeDistance(touch, direction) > edge) return;
			if (_canScroll(e.target, el, direction)) return;
			x = touch.clientX;
			y = touch.clientY;
			time = e.timeStamp;
			pending = true;
			detach();
			node = e.target;
			node.addEventListener("touchmove", onMove, { passive: false });
			node.addEventListener("touchend", onEnd, { passive: true });
			node.addEventListener("touchcancel", onEnd, { passive: true });
			// Also on the document, in case the browser sends the end somewhere else.
			document.addEventListener("touchend", onEnd, { capture: true, passive: true });
			document.addEventListener("touchcancel", onEnd, { capture: true, passive: true });
		};

		const onMove = (e: Event) => {
			const touch = (e as TouchEvent).touches[0];
			if (!touch) return;
			const { direction, start } = optionsRef.current;
			if (pending) {
				const dx = touch.clientX - x;
				const dy = touch.clientY - y;
				if (Math.abs(dx) < _SLOP && Math.abs(dy) < _SLOP) return;
				pending = false;
				if (_active || _getDistance(dx, dy, direction) <= 0 || !_isAlong(dx, dy, direction)) return detach();
				_active = true;
				const size = capture ? _getScreenSize(direction) : _getSize(el as Element, direction);
				const scrub = new TransitionScrub(start);
				if (!scrub.started) {
					_active = false;
					return detach();
				}
				gesture = { x, y, size, distance: 0, time, speed: 0, scrub };
			}
			if (!gesture) return;
			if (e.cancelable) e.preventDefault();
			const distance = Math.max(0, _getDistance(touch.clientX - gesture.x, touch.clientY - gesture.y, direction));
			gesture.speed = (distance - gesture.distance) / Math.max(1, e.timeStamp - gesture.time);
			gesture.distance = distance;
			gesture.time = e.timeStamp;
			gesture.scrub?.seek(distance / gesture.size);
		};

		const onEnd = (e: Event) => {
			// The document and the touched node both get the end. Act on it once.
			if (!pending && !gesture) return detach();
			pending = false;
			detach();
			const ended = gesture;
			gesture = undefined;
			if (!ended?.scrub) return;
			const { distance: part = 0.35, cancel, commit } = optionsRef.current;
			const { scrub, size, distance } = ended;
			// A finger that stopped before it lifted is not a flick.
			const speed = e.timeStamp - ended.time > 100 ? 0 : ended.speed;
			const done = e.type === "touchend" && (distance > size * part || (speed > _FLICK && distance > _SLOP * 2));
			const end = done ? scrub.finish().then(() => commit?.()) : scrub.cancel(cancel);
			end
				.finally(() => {
					_active = false;
				})
				.catch(BLACKHOLE);
		};

		// A swipe on `document` listens in the capture phase, so it decides before a swipe on an element below it.
		const listen = { capture, passive: true };
		el.addEventListener("touchstart", onStart, listen);
		// A touchmove listener that is not passive must be on the target before the touch starts, or Safari scrolls the page and ignores `preventDefault()`.
		const block = (e: Event) => {
			if (gesture && e.cancelable) e.preventDefault();
		};
		el.addEventListener("touchmove", block, { capture, passive: false });
		return () => {
			el.removeEventListener("touchstart", onStart, listen);
			el.removeEventListener("touchmove", block, { capture });
			// A swipe that runs now ends on its own: the update may unmount this component (for example a closed notice).
			if (!gesture) detach();
		};
	}, [target]);
}

function _isDocument(target: RefObject<Element | null> | Document | Element): target is Document {
	return typeof Document !== "undefined" && target instanceof Document;
}

/** Get how far a move goes in the swipe's direction (negative when it goes the other way). */
function _getDistance(dx: number, dy: number, direction: SwipeDirection): number {
	if (direction === "right") return dx;
	if (direction === "left") return -dx;
	if (direction === "down") return dy;
	return -dy;
}

/** Does a move go mostly along the swipe's axis? */
function _isAlong(dx: number, dy: number, direction: SwipeDirection): boolean {
	return direction === "left" || direction === "right" ? Math.abs(dx) > Math.abs(dy) : Math.abs(dy) > Math.abs(dx);
}

/** Get how far a touch is from the screen edge the swipe moves away from. */
function _getEdgeDistance({ clientX, clientY }: Touch, direction: SwipeDirection): number {
	if (direction === "right") return clientX;
	if (direction === "left") return window.innerWidth - clientX;
	if (direction === "down") return clientY;
	return window.innerHeight - clientY;
}

function _getSize(el: Element, direction: SwipeDirection): number {
	const { width, height } = el.getBoundingClientRect();
	return Math.max(1, direction === "left" || direction === "right" ? width : height);
}

function _getScreenSize(direction: SwipeDirection): number {
	return direction === "left" || direction === "right" ? window.innerWidth : window.innerHeight;
}

/** Can an element between the touched element and the swipe's target still scroll the other way to the swipe, so the finger should scroll it? */
function _canScroll(from: Element, to: Element | Document, direction: SwipeDirection): boolean {
	for (let el: Element | null = from; el && el !== to; el = el.parentElement) {
		if (_canScrollElement(el, direction)) return true;
	}
	return !_isDocument(to) && _canScrollElement(to, direction);
}

function _canScrollElement(el: Element, direction: SwipeDirection): boolean {
	const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = el;
	if (direction === "down" || direction === "up") {
		if (scrollHeight <= clientHeight || !_isScrollable(getComputedStyle(el).overflowY)) return false;
		return direction === "down" ? scrollTop > 0 : scrollTop + clientHeight < scrollHeight - 1;
	}
	if (scrollWidth <= clientWidth || !_isScrollable(getComputedStyle(el).overflowX)) return false;
	return direction === "right" ? scrollLeft > 0 : scrollLeft + clientWidth < scrollWidth - 1;
}

function _isScrollable(overflow: string): boolean {
	return overflow === "auto" || overflow === "scroll";
}

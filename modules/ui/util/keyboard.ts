/** How far the keyboard must squash or push up the visual viewport before it counts as open, in pixels. */
const _GAP = 100;

/** The longest `waitForKeyboard()` waits, in milliseconds. */
const _MAX = 500;

/**
 * Is the on-screen keyboard open (or still closing)?
 * - On iOS (Safari, home-screen web apps and `WKWebView`) the keyboard makes the visual viewport shorter than the window,
 *   or pushes it up (`visualViewport.offsetTop`). When the page cannot scroll, iOS shrinks the window too, so only the push
 *   shows the keyboard.
 * - Returns `false` when the page is zoomed in, because a zoomed visual viewport is also shorter than the window and moves.
 * - Returns `false` where the keyboard resizes the whole page (Android Chrome by default), and with no on-screen keyboard.
 *
 * @returns `true` when the visual viewport is much shorter than the window, or pushed up.
 * @example if (isKeyboardOpen()) await waitForKeyboard();
 * @see https://shelving.cc/ui/isKeyboardOpen
 */
export function isKeyboardOpen(): boolean {
	if (typeof window === "undefined") return false;
	const viewport = window.visualViewport;
	if (!viewport || Math.abs(viewport.scale - 1) > 0.01) return false;
	return window.innerHeight - viewport.height > _GAP || viewport.offsetTop > _GAP;
}

/**
 * Lower the on-screen keyboard, and wait until it is down.
 * - Blurs the focused text field, if there is one, so the keyboard starts to close.
 * - While the keyboard is open or closing (`isKeyboardOpen()`), it checks once each frame and goes on when the keyboard is
 *   down, or after half a second at most. It then waits one more frame, so the page paints at full height first.
 * - Returns nothing when there is nothing to wait for, so a caller can go on at once without a promise.
 * - Use it before a page slide: a keyboard that closes during a view transition resizes the page in the middle of it.
 *
 * @returns A promise that resolves when the keyboard is down, or nothing when it is down already.
 * @example const waiting = waitForKeyboard(); if (waiting) await waiting;
 * @see https://shelving.cc/ui/waitForKeyboard
 */
export function waitForKeyboard(): Promise<void> | void {
	if (typeof window === "undefined") return;
	_blurTextField();
	if (!isKeyboardOpen()) return;
	return new Promise<void>(resolve => {
		const start = performance.now();
		const check = (now: number) => {
			// When the keyboard is down, wait one more frame so the page paints at full height before anything snapshots it.
			if (now - start >= _MAX || !isKeyboardOpen()) return void requestAnimationFrame(() => resolve());
			requestAnimationFrame(check);
		};
		requestAnimationFrame(check);
	});
}

/** Blur the focused element when it takes typed text (and so shows the on-screen keyboard). */
function _blurTextField(): void {
	if (typeof document === "undefined") return;
	const el = document.activeElement;
	if (el instanceof HTMLElement && _isTextField(el)) el.blur();
}

/** Does an element take typed text? */
function _isTextField(el: HTMLElement): boolean {
	if (el.isContentEditable || el instanceof HTMLTextAreaElement) return true;
	if (el instanceof HTMLSelectElement) return false;
	return el instanceof HTMLInputElement && !_NO_KEYBOARD.has(el.type);
}

/** Input types that show no on-screen keyboard. */
const _NO_KEYBOARD = new Set(["button", "checkbox", "color", "file", "hidden", "image", "radio", "range", "reset", "submit"]);

/// <reference types="react/canary" />

/** How long to wait for the update to start a view transition, in milliseconds. */
const _CATCH_TIMEOUT = 1000;

/** Easing for the end of a scrub (ease out). */
const _EASE_OUT = (t: number) => 1 - (1 - t) ** 3;

/**
 * Take manual control of the view transition that an update starts.
 *
 * - The constructor runs `update()` at once and catches the next view transition that starts (for example the one React starts for a state change inside `startTransition()`).
 * - When the transition is ready, it pauses every animation of the transition, so `seek()` can move it by hand.
 * - `finish()` plays it to the end. `cancel()` plays it back to the start, runs an undo, and ends it.
 * - Without view transitions (older browsers), or if `update()` starts none, the update still happens: `seek()` does nothing, `finish()` ends at once, and `cancel()` just runs the undo.
 * - If `update()` returns `false`, nothing is caught, and `started` is `false`.
 * - Only one view transition runs at a time. A new one skips this one, which ends it at its end state.
 *
 * @see https://shelving.cc/ui/TransitionScrub
 */
export class TransitionScrub {
	/** `false` if `update()` returned `false`, so there is nothing to scrub. */
	readonly started: boolean;

	private _progress = 0;
	private _transition: ViewTransition | undefined;
	private _animations: Animation[] = [];
	private readonly _ready: Promise<boolean>;

	/**
	 * @param update A change that starts a view transition. Return `false` to start nothing.
	 */
	constructor(update: () => unknown) {
		if (typeof document === "undefined" || typeof document.startViewTransition !== "function") {
			this.started = update() !== false;
			this._ready = Promise.resolve(false);
			return;
		}
		let resolve: (ready: boolean) => void = () => undefined;
		this._ready = new Promise<boolean>(r => {
			resolve = r;
		});
		const original = document.startViewTransition;
		const restore = () => {
			if (document.startViewTransition === wrapped) document.startViewTransition = original;
		};
		const wrapped = function (this: Document, ...args: Parameters<Document["startViewTransition"]>): ViewTransition {
			restore();
			const transition = original.apply(this, args);
			scrub._catch(transition).then(resolve, () => resolve(false));
			return transition;
		} as Document["startViewTransition"];
		const scrub = this;
		document.startViewTransition = wrapped;
		this.started = update() !== false;
		if (!this.started) {
			restore();
			resolve(false);
			return;
		}
		setTimeout(() => {
			if (document.startViewTransition !== wrapped) return;
			restore();
			resolve(false);
		}, _CATCH_TIMEOUT);
	}

	/** Pause the caught transition when it is ready, and move it to the current progress. */
	private async _catch(transition: ViewTransition): Promise<boolean> {
		this._transition = transition;
		await transition.ready;
		const animations = document.getAnimations().filter(_isTransitionAnimation);
		for (const animation of animations) {
			animation.pause();
			animation.effect?.updateTiming({ easing: "linear" });
		}
		this._animations = animations;
		_seek(animations, this._progress);
		return true;
	}

	/**
	 * Move the transition to a point, from `0` (start) to `1` (end).
	 * - Safe to call before the transition is ready: it moves there as soon as it is.
	 *
	 * @param progress How far through the transition, from `0` to `1`.
	 * @see https://shelving.cc/ui/TransitionScrub/seek
	 */
	seek(progress: number): void {
		this._progress = Math.max(0, Math.min(1, progress));
		_seek(this._animations, this._progress);
	}

	/**
	 * Play the transition from where it is to the end, then end it.
	 *
	 * @returns A promise that resolves when the transition has ended.
	 * @see https://shelving.cc/ui/TransitionScrub/finish
	 */
	async finish(): Promise<void> {
		if (!(await this._ready)) return;
		await _tween(this._animations, this._progress, 1);
		this._progress = 1;
		this._transition?.skipTransition();
	}

	/**
	 * Play the transition back to the start, run `undo()`, and then end the transition.
	 * - `undo()` must put back the state from before the update, so the page matches the start of the transition when it ends.
	 * - If `undo()` returns a promise (for example one that resolves after React commits), it waits for it before it ends the transition.
	 *
	 * @param undo Put back the state from before the update.
	 * @returns A promise that resolves when the transition has ended.
	 * @see https://shelving.cc/ui/TransitionScrub/cancel
	 */
	async cancel(undo: () => PromiseLike<void> | void): Promise<void> {
		if (!(await this._ready)) {
			await undo();
			return;
		}
		await _tween(this._animations, this._progress, 0);
		this._progress = 0;
		await undo();
		this._transition?.skipTransition();
	}
}

/** Is this one of a view transition's own animations (on a `::view-transition-*` pseudo-element)? */
function _isTransitionAnimation(animation: Animation): boolean {
	const effect = animation.effect;
	return effect instanceof KeyframeEffect && !!effect.pseudoElement?.startsWith("::view-transition");
}

/** Get how long an animation runs, in milliseconds. */
function _getDuration(animation: Animation): number {
	const duration = animation.effect?.getComputedTiming().duration;
	return typeof duration === "number" ? duration : 0;
}

/** Set every animation to `progress` (0 to 1) of the way through. Just short of the end, so the animation does not finish. */
function _seek(animations: readonly Animation[], progress: number): void {
	for (const animation of animations) animation.currentTime = progress * _getDuration(animation) * 0.999;
}

/** Move the animations from one progress to another with an ease out, frame by frame, and stay paused at the end. */
function _tween(animations: readonly Animation[], from: number, to: number): Promise<void> {
	const duration = Math.max(120, Math.min(300, Math.abs(to - from) * 400));
	return new Promise(resolve => {
		const start = performance.now();
		const frame = (now: number) => {
			const t = Math.min(1, (now - start) / duration);
			_seek(animations, from + (to - from) * _EASE_OUT(t));
			if (t < 1) requestAnimationFrame(frame);
			else resolve();
		};
		requestAnimationFrame(frame);
	});
}

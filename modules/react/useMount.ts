import { useRef } from "react";
import { type Start, Starter } from "../util/start.js";

/**
 * Call a `StartCallback` when an element is mounted, and the returned `StopCallback` when it's unmounted again.
 * - Takes care of state so `start()` won't be called twice for the same element.
 * - Returns a `RefCallback` which should be set as `ref={ref}` on the target element.
 */
export function useMount<T extends Element>(start: Start<[T]>): React.RefCallback<T> {
	const ref = useRef<React.RefCallback<T>>();
	if (!ref.current) {
		let current: T | null;
		const starter = new Starter(start);
		ref.current = (next: T | null) => {
			if (current !== next) {
				starter.stop();
				current = next;
				if (current) starter.start(current);
			}
		};
	}
	return ref.current;
}

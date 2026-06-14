import { useEffect, useState } from "react";

/**
 * Re-render a component automatically on a fixed interval.
 *
 * - Holds the current time in state and updates it every `interval` milliseconds, forcing a refresh.
 * - Clears the timer on unmount or when `interval` changes.
 *
 * @param interval The refresh period in milliseconds.
 * @example useRefresh(1000); // re-renders once per second, e.g. for a live clock
 * @see https://dhoulb.github.io/shelving/ui/util/refresh/useRefresh
 */
export function useRefresh(interval: number): void {
	const [_currentTime, setCurrentTime] = useState<number>(() => Date.now());

	useEffect(() => {
		const timer = window.setInterval(() => setCurrentTime(Date.now()), interval);
		return () => window.clearInterval(timer);
	}, [interval]);
}

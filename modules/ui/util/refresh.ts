import { useEffect, useState } from "react";

/** Refresh a component automatically every X milliseconds. */
export function useRefresh(interval: number): void {
	const [_currentTime, setCurrentTime] = useState<number>(() => Date.now());

	useEffect(() => {
		const timer = window.setInterval(() => setCurrentTime(Date.now()), interval);
		return () => window.clearInterval(timer);
	}, [interval]);
}

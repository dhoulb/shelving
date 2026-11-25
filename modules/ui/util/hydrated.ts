import { useSyncExternalStore } from "react";

function _subscribe(): () => void {
	return () => undefined;
}
function _getClient(): boolean {
	return true;
}
function _getServer(): boolean {
	return false;
}

/**
 * Whether this render can use browser-only state (such as navigation history).
 * - `false` in a server render, and in the first client render that hydrates server HTML, so both make the same HTML.
 * - `true` in every other client render. After hydration, React renders again with `true`.
 */
export function useHydrated(): boolean {
	return useSyncExternalStore(_subscribe, _getClient, _getServer);
}

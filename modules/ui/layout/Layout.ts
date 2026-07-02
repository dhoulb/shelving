import { useEffect } from "react";

/**
 * Track the dynamic viewport height so layout safe-area insets follow the on-screen keyboard.
 *
 * - Writes a `--layout-inset-bottom` custom property reflecting the space hidden behind the keyboard.
 *
 * @returns A cleanup function that removes the listeners and property, or `undefined` when `visualViewport` is unavailable.
 * @todo This can be removed once Safari iOS supports interactive-widget viewport property. https://caniuse.com/mdn-html_elements_meta_name_viewport_interactive-widget
 * @see https://shelving.cc/ui/useSafeKeyboardArea
 */
export function useSafeKeyboardArea() {
	useEffect(_safeKeyboardArea, []);
}

function _safeKeyboardArea() {
	const vv = window.visualViewport;
	if (!vv) return;
	const onResize = () => {
		const bottom = Math.max(window.innerHeight - vv.height - vv.offsetTop, 0);
		document.documentElement.style.setProperty("--layout-inset-bottom", `${bottom}px`);
	};
	vv.addEventListener("resize", onResize);
	vv.addEventListener("scroll", onResize);
	onResize();
	return () => {
		document.documentElement.style.removeProperty("--layout-inset-bottom");
		vv.removeEventListener("resize", onResize);
		vv.removeEventListener("scroll", onResize);
	};
}

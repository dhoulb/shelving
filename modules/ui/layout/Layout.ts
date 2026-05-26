import { getModuleClass } from "../util/css.js";
import styles from "./Layout.module.css";

/** Resolved `.layout` class — for components that want to compose the layout's padding/scroll/safe-area behaviour onto their own element (e.g. `CenteredLayout`). */
export const LAYOUT_CLASS = getModuleClass(styles, "layout");

/**
 * Adapt the property to the dynamic height of the view port when the keyboard pops up.
 * - This dynamically updates the value we use as the "safe area"
 *
 * @todo This can be removed once Safari iOS supports interactive-widget viewport property. https://caniuse.com/mdn-html_elements_meta_name_viewport_interactive-widget
 */
export function useSafeKeyboardArea() {
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

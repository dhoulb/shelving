import { Icon } from "./Icon.js";
import { LoadingIcon } from "./LoadingIcon.js";

/**
 * Shared loading spinner element with a stable `key`, ready to drop into `Suspense` fallbacks and lists.
 *
 * - A `<LoadingIcon>` rendered through `<Icon>`, so it picks up icon sizing, colour, and centring.
 *
 * @see https://shelving.cc/ui/LOADING
 */
export const LOADING = <Icon icon={LoadingIcon} key="loading" />;

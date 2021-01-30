/** Just get important part of a URL, e.g. `http://shax.com/test?uid=129483` → `shax.com/test` */
export const formatUrl = (url: string | URL): string => {
	const u = url instanceof URL ? url : new URL(url);
	return `${u.host}${u.pathname.length > 1 ? u.pathname : ""}`;
};

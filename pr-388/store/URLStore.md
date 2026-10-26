# URLStore

- Kind: class
- Import: `import { URLStore } from "shelving/store";`
- Extends: `BusyStore<ImmutableURL, PossibleURL>`

Store a URL, e.g. `https://top.com/a/b/c`
- Accepts any `PossibleURL` as input and normalises it to an `ImmutableURL` (resolved against `this.base`).
- Exposes the URL's components (`href`, `origin`, `pathname`, etc.) and helpers to read and mutate its search params.

A `Store` for a URL such as `https://example.com/a/b/c`. `URLStore` coerces any assigned URL or URL string (resolved against an optional `base`), exposes the URL's parts as accessors, and adds query-param and route-matching helpers.

## Usage

```ts
import { URLStore } from "shelving/store";

const url = new URLStore("https://example.com/search?q=hats");

console.log(url.hostname);        // "example.com"
console.log(url.getParam("q"));   // "hats"

url.setParam("page", "2");        // updates the stored URL's query
url.value = "/search?q=shoes";    // assign a relative path — resolved against the current URL

url.isActive("https://example.com/search?q=shoes"); // true
url.isProud("https://example.com/search");          // true — current URL sits below this one
```

Param helpers come in mutating (`setParam`, `updateParams`, `deleteParam`, `clearParams`) and non-mutating (`withParam`, `withParams`, `omitParam`) forms — the latter return a new URL without changing the store.


## Signatures

```ts
new URLStore(url: PossibleURL, base?: PossibleURL)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `url` | `PossibleURL` |  |
| `base` | `PossibleURL` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `URLStore` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `base` | `ImmutableURL \| undefined` | Base URL that relative URL inputs are resolved against, or `undefined` if none was set. Read only. |
| `href` | `URLString` | Get or set the full URL string (e.g. `https://top.com/a/b/c?x=1`). |
| `origin` | `URLString` | Get the origin of the URL (e.g. `https://top.com`). Read only. |
| `protocol` | `URIScheme` | Get the protocol/scheme of the URL (e.g. `https:`). Read only. |
| `username` | `string` | Get the username component of the URL. Read only. |
| `password` | `string` | Get the password component of the URL. Read only. |
| `hostname` | `string` | Get the hostname of the URL (e.g. `top.com`). Read only. |
| `host` | `string` | Get the host of the URL including port (e.g. `top.com:8080`). Read only. |
| `port` | `string` | Get the port of the URL, or an empty string if none is set. Read only. |
| `pathname` | `AbsolutePath` | Get the absolute pathname of the URL (e.g. `/a/b/c`). Read only. |
| `search` | `string` | Get the URL params as a query string (e.g. `?x=1&y=2`). Read only. |
| `params` | `URIParams` | Get the URL params as a dictionary of key/value pairs. Read only. |

## Methods

- [getParam](URLStore/getParam.md): Return a single param in this URL, or undefined if it could not be found.
- [requireParam](URLStore/requireParam.md): Require a single param in this URL, or throw RequiredError if it could not be found.
- [setParams](URLStore/setParams.md): Set all params in this URL (all current params are cleared first).
- [setParam](URLStore/setParam.md): Set a single named param in this URL.
- [updateParams](URLStore/updateParams.md): Update several params in this URL (merged with current params).
- [deleteParam](URLStore/deleteParam.md): Delete one or more params from this URL.
- [deleteParams](URLStore/deleteParams.md): Delete one or more params from this URL.
- [clearParams](URLStore/clearParams.md): Clear all params from this URL.
- [withParam](URLStore/withParam.md): Return the current URL with an additional param (without mutating this store).
- [withParams](URLStore/withParams.md): Return the current URL with additional params (without mutating this store).
- [omitParams](URLStore/omitParams.md): Return the current URL with one or more params removed (without mutating this store).
- [omitParam](URLStore/omitParam.md): Return the current URL with a single param removed (without mutating this store).
- [isActive](URLStore/isActive.md): Is target active relative to this store's URL?
- [isProud](URLStore/isProud.md): Is target proud relative to this store's URL?

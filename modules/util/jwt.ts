import { RequestError, UnauthorizedError } from "../error/RequestError.js";
import { ValueError } from "../error/ValueError.js";
import { decodeBase64UrlBytes, decodeBase64UrlString, encodeBase64Url } from "./base64.js";
import { requireBytes } from "./bytes.js";
import { DAY } from "./constants.js";
import type { Data } from "./data.js";
import type { AnyFunction } from "./function.js";

// Constants.
const TOKEN_HEADER = { alg: "HS512", typ: "JWT" };
const TOKEN_EXPIRY_MS = DAY * 10;
const TOKEN_MINIMUM_SECRET = 16;

function _getKey(secret: string, ...usages: KeyUsage[]): Promise<CryptoKey> {
	return crypto.subtle.importKey("raw", requireBytes(secret), { name: "HMAC", hash: { name: "SHA-512" } }, false, usages);
}

/**
 * Encode a JWT and return the string token.
 * - Currently only supports HMAC SHA-512 signing.
 *
 * @throws ValueError If the input parameters, e.g. `secret` or `issuer`, are invalid.
 */
export async function encodeToken(claims: Data, secret: string): Promise<string> {
	if (typeof secret !== "string" || secret.length < TOKEN_MINIMUM_SECRET)
		throw new ValueError(`JWT secret must be string with minimum ${TOKEN_MINIMUM_SECRET} characters`, {
			received: secret,
			caller: encodeToken,
		});

	// Encode header.
	const header = encodeBase64Url(JSON.stringify(TOKEN_HEADER));

	// Encode payload.
	const iat = Math.floor(Date.now() / 1000);
	const exp = Math.floor(iat + TOKEN_EXPIRY_MS / 1000);
	const payload = encodeBase64Url(JSON.stringify({ iat, exp, ...claims }));

	// Create signature.
	const key = await _getKey(secret, "sign");
	const signature = encodeBase64Url(await crypto.subtle.sign("HMAC", key, requireBytes(`${header}.${payload}`)));

	// Combine token.
	return `${header}.${payload}.${signature}`;
}

/** Parts that make up a JSON Web Token. */
export type TokenData = {
	header: string;
	payload: string;
	signature: string;
	headerData: Data;
	payloadData: Data;
};

/**
 * Split a JSON Web Token into its header, payload, and signature, and decode and parse the JSON.
 */
export function splitToken(token: unknown): TokenData {
	return _splitToken(splitToken, token);
}
export function _splitToken(caller: AnyFunction, token: unknown): TokenData {
	if (typeof token !== "string") throw new RequestError("JWT token must be string", { received: token, caller });

	// Split token.
	const [header, payload, signature] = token.split(".");
	if (!header || !payload || !signature)
		throw new RequestError("JWT token must have header, payload, and signature", { received: token, caller });

	// Decode header.
	let headerData: Data;
	try {
		headerData = JSON.parse(decodeBase64UrlString(header));
	} catch {
		throw new RequestError("JWT token header must be base64Url encoded JSON", { received: token, caller });
	}

	// Decode payload.
	let payloadData: Data;
	try {
		payloadData = JSON.parse(decodeBase64UrlString(payload));
	} catch {
		throw new RequestError("JWT token payload must be base64Url encoded JSON", { received: token, caller });
	}

	return { header, payload, headerData, payloadData, signature };
}

/**
 * Decode a JWT, verify it, and return the full payload data.
 * - Currently only supports HMAC SHA-512 signing.
 *
 * @throws ValueError If the input parameters, e.g. `secret` or `issuer`, are invalid.
 * @throws RequestError If the token is invalid or malformed.
 * @throws UnauthorizedError If the token signature is incorrect, token is expired or not issued yet.
 */
export async function verifyToken(token: unknown, secret: string): Promise<Data> {
	if (typeof secret !== "string" || secret.length < TOKEN_MINIMUM_SECRET)
		throw new ValueError(`JWT secret must be string with minimum ${TOKEN_MINIMUM_SECRET} characters`, {
			received: secret,
			caller: verifyToken,
		});

	const { header, payload, signature, headerData, payloadData } = _splitToken(verifyToken, token);

	// Validate header.
	if (headerData.typ !== TOKEN_HEADER.typ)
		throw new RequestError(`JWT header type must be \"${TOKEN_HEADER.typ}\"`, { received: headerData.typ, caller: verifyToken });
	if (headerData.alg !== TOKEN_HEADER.alg)
		throw new RequestError(`JWT header algorithm must be \"${TOKEN_HEADER.alg}\"`, { received: headerData.alg, caller: verifyToken });

	// Validate signature.
	const key = await _getKey(secret, "verify");
	const isValid = await crypto.subtle.verify("HMAC", key, decodeBase64UrlBytes(signature), requireBytes(`${header}.${payload}`));
	if (!isValid) throw new UnauthorizedError("JWT signature does not match", { received: token, caller: verifyToken });

	// Validate payload.
	const { iat, exp } = payloadData;
	const now = Math.floor(Date.now() / 1000);
	if (typeof iat === "number" && iat > now) throw new UnauthorizedError("JWT not issued yet", { received: iat, caller: verifyToken });
	if (typeof exp === "number" && exp < now) throw new UnauthorizedError("JWT has expired", { received: exp, caller: verifyToken });

	return payloadData;
}

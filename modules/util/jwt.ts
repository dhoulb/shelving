import { UnauthorizedError } from "../error/RequestError.js";
import { ValueError } from "../error/ValueError.js";
import { decodeBase64URLBytes, decodeBase64URLString, encodeBase64URL } from "./base64.js";
import { type PossibleBytes, getBytes, requireBytes } from "./bytes.js";
import { DAY } from "./constants.js";
import type { Data } from "./data.js";
import type { AnyCaller } from "./function.js";
import type { AnyFunction } from "./function.js";

// Constants.
const HASH = "SHA-512";
const ALGORITHM = { name: "HMAC", hash: HASH };
const HEADER = { alg: "HS512", typ: "JWT" };
const EXPIRY_MS = DAY * 10;
const SKEW_MS = 60; // Allow 1 minute clock skew.
const SECRET_BYTES = 64; // Minimum 64 bytes / 512 bits

function _getKey(caller: AnyFunction, secret: PossibleBytes, ...usages: KeyUsage[]): Promise<CryptoKey> {
	const bytes = getBytes(secret);
	if (!bytes || bytes.length < SECRET_BYTES)
		throw new ValueError(`JWT secret must be byte sequence with mininum ${SECRET_BYTES} bytes`, {
			received: secret,
			caller,
		});
	return crypto.subtle.importKey("raw", requireBytes(secret), ALGORITHM, false, usages);
}

/**
 * Encode a JWT and return the string token.
 * - Currently only supports HMAC SHA-512 signing.
 *
 * @throws ValueError If the input parameters, e.g. `secret` or `issuer`, are invalid.
 */
export async function encodeToken(claims: Data, secret: PossibleBytes): Promise<string> {
	// Encode header.
	const header = encodeBase64URL(JSON.stringify(HEADER));

	// Encode payload.
	const now = Math.floor(Date.now() / 1000);
	const exp = Math.floor(now + EXPIRY_MS / 1000);
	const payload = encodeBase64URL(JSON.stringify({ nbf: now, iat: now, exp, ...claims }));

	// Create signature.
	const key = await _getKey(encodeToken, secret, "sign");
	const signature = encodeBase64URL(await crypto.subtle.sign("HMAC", key, requireBytes(`${header}.${payload}`)));

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
	signatureBytes: Uint8Array;
};

/**
 * Split a JSON Web Token into its header, payload, and signature, and decode and parse the JSON.
 */
export function splitToken(token: string, caller: AnyCaller = splitToken): TokenData {
	// Split token.
	const [header, payload, signature] = token.split(".");
	if (!header || !payload || !signature)
		throw new UnauthorizedError("JWT token must have header, payload, and signature", { received: token, caller });

	// Decode signature.
	let signatureBytes: Uint8Array;
	try {
		signatureBytes = decodeBase64URLBytes(signature);
	} catch (cause) {
		throw new UnauthorizedError("JWT token signature must be Base64URL encoded", { received: signature, cause, caller });
	}

	// Decode header.
	let headerData: Data;
	try {
		headerData = JSON.parse(decodeBase64URLString(header));
	} catch (cause) {
		throw new UnauthorizedError("JWT token header must be Base64URL encoded JSON", { received: header, cause, caller });
	}

	// Decode payload.
	let payloadData: Data;
	try {
		payloadData = JSON.parse(decodeBase64URLString(payload));
	} catch (cause) {
		throw new UnauthorizedError("JWT token payload must be Base64URL encoded JSON", { received: payload, cause, caller });
	}

	return { header, payload, signature, headerData, payloadData, signatureBytes };
}

/**
 * Decode a JWT, verify it, and return the full payload data.
 * - Currently only supports HMAC SHA-512 signing.
 *
 * @throws ValueError If the input parameters, e.g. `secret` or `issuer`, are invalid.
 * @throws UnauthorizedError If the token is invalid or malformed.
 * @throws UnauthorizedError If the token signature is incorrect, token is expired or not issued yet.
 */
export async function verifyToken(token: string, secret: PossibleBytes, caller: AnyCaller = verifyToken): Promise<Data> {
	const { header, payload, signature, headerData, payloadData } = splitToken(token, caller);

	// Validate header.
	if (headerData.typ !== HEADER.typ)
		throw new UnauthorizedError(`JWT header type must be \"${HEADER.typ}\"`, { received: headerData.typ, caller });
	if (headerData.alg !== HEADER.alg)
		throw new UnauthorizedError(`JWT header algorithm must be \"${HEADER.alg}\"`, { received: headerData.alg, caller });

	// Validate signature.
	const key = await _getKey(verifyToken, secret, "verify");
	const isValid = await crypto.subtle.verify("HMAC", key, decodeBase64URLBytes(signature), requireBytes(`${header}.${payload}`));
	if (!isValid) throw new UnauthorizedError("JWT signature does not match", { received: token, caller });

	// Validate payload.
	const { nbf, iat, exp } = payloadData;
	const now = Math.floor(Date.now() / 1000);
	if (typeof nbf === "number" && nbf < now - SKEW_MS)
		throw new UnauthorizedError("JWT cannot be used yet", { received: payloadData, expected: now, caller });
	if (typeof iat === "number" && iat > now + SKEW_MS)
		throw new UnauthorizedError("JWT not issued yet", { received: payloadData, expected: now, caller });
	if (typeof exp === "number" && exp < now - SKEW_MS)
		throw new UnauthorizedError("JWT has expired", { received: payloadData, expected: now, caller });

	return payloadData;
}

/**
 * Set the `Authorization: Bearer {token}` on a `Request` object (by reference).
 *
 * @param request The `Request` object to set the token on.
 * @returns The same `Request` object that was passed in.
 */
export function setRequestToken(request: Request, token: string): Request {
	request.headers.set("Authorization", `Bearer ${token}`);
	return request;
}

/**
 * Extract the `Authorization: Bearer {token}` from a `Request` object, or return `undefined` if not set.
 *
 * @param request The `Request` object possibly containing an `Authorization: Bearer {token}` header to extract the token from.
 * @returns The string token extracted from the `Authorization` header, or `undefined` if not set.
 */
export function getRequestToken(request: Request): string | undefined {
	const auth = request.headers.get("Authorization");
	if (auth?.startsWith("Bearer ")) return auth.substring(7).trim() || undefined;
}

/**
 * Extract the `Authorization: Bearer {token}` from a `Request` object, or throw `UnauthorizedError` if not set or malformed.
 *
 * @param request The `Request` object containing an `Authorization: Bearer {token}` header to extract the token from.
 * @returns The string token extracted from the `Authorization` header.
 * @throws UnauthorizedError If the `Authorization` header is not set, or the JWT it contains is not well-formed.
 */
export function requireRequestToken(request: Request, caller: AnyCaller = requireRequestToken): string {
	const token = getRequestToken(request);
	if (!token) throw new UnauthorizedError("JWT is required", { received: request.headers.get("Authorization"), caller });
	return token;
}

/**
 * Extract the `Authorization: Bearer {token}` from a `Request` object and verify it using a signature, or throw `UnauthorizedError` if not set, malformed, or invalid.
 * - Same as doing `requireRequestToken(request)` and then `verifyToken(token, secret)`.
 *
 * @param request The `Request` object containing an `Authorization: Bearer {token}` header to extract the token from.
 * @param secret The secret key to verify the JWT signature with.
 *
 * @returns The decoded payload data from the JWT.
 * @throws UnauthorizedError If the `Authorization` header is not set, the JWT it contains is not well-formed, or the JWT signature is invalid.
 *
 * @example `const { sub, iss, customClaim } = await verifyRequestToken(request, secret);`
 */
export function verifyRequestToken(request: Request, secret: PossibleBytes, caller: AnyCaller = verifyRequestToken): Promise<Data> {
	const token = requireRequestToken(request, caller);
	return verifyToken(token, secret, caller);
}

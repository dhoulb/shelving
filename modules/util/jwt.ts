import { RequestError, UnauthorizedError } from "../error/RequestError.js";
import { ValueError } from "../error/ValueError.js";
import { decodeBase64URLBytes, decodeBase64URLString, encodeBase64URL } from "./base64.js";
import { type PossibleBytes, getBytes, requireBytes } from "./bytes.js";
import { DAY } from "./constants.js";
import type { Data } from "./data.js";
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
		headerData = JSON.parse(decodeBase64URLString(header));
	} catch {
		throw new RequestError("JWT token header must be base64Url encoded JSON", { received: token, caller });
	}

	// Decode payload.
	let payloadData: Data;
	try {
		payloadData = JSON.parse(decodeBase64URLString(payload));
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
export async function verifyToken(token: unknown, secret: PossibleBytes): Promise<Data> {
	const { header, payload, signature, headerData, payloadData } = _splitToken(verifyToken, token);

	// Validate header.
	if (headerData.typ !== HEADER.typ)
		throw new RequestError(`JWT header type must be \"${HEADER.typ}\"`, { received: headerData.typ, caller: verifyToken });
	if (headerData.alg !== HEADER.alg)
		throw new RequestError(`JWT header algorithm must be \"${HEADER.alg}\"`, { received: headerData.alg, caller: verifyToken });

	// Validate signature.
	const key = await _getKey(verifyToken, secret, "verify");
	const isValid = await crypto.subtle.verify("HMAC", key, decodeBase64URLBytes(signature), requireBytes(`${header}.${payload}`));
	if (!isValid) throw new UnauthorizedError("JWT signature does not match", { received: token, caller: verifyToken });

	// Validate payload.
	const { nbf, iat, exp } = payloadData;
	const now = Math.floor(Date.now() / 1000);
	if (typeof nbf === "number" && nbf < now - SKEW_MS)
		throw new UnauthorizedError("JWT cannot be used yet", { received: payloadData, expected: now, caller: verifyToken });
	if (typeof iat === "number" && iat > now + SKEW_MS)
		throw new UnauthorizedError("JWT not issued yet", { received: payloadData, expected: now, caller: verifyToken });
	if (typeof exp === "number" && exp < now - SKEW_MS)
		throw new UnauthorizedError("JWT has expired", { received: payloadData, expected: now, caller: verifyToken });

	return payloadData;
}

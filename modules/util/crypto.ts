import { ValueError } from "../error/ValueError.js";
import { decodeBase64URLBytes, encodeBase64URL } from "./base64.js";
import { type Bytes, requireBytes } from "./bytes.js";

// Constants.
const ALGORITHM = { name: "PBKDF2", hash: "SHA-512" };
const ITERATIONS = 500000;
const SALT_LENGTH = 16; // 16 bytes = 128 bits
const HASH_LENGTH = 64; // 64 bytes = 512 bits
const PASSWORD_LENGTH = 6;

/** Import a key for PBKDF2 operations (deriveBits) using SHA-512. */
function _getKey(password: string): Promise<CryptoKey> {
	return crypto.subtle.importKey("raw", requireBytes(password), ALGORITHM, false, ["deriveBits"]);
}

/** Get random bytes from the crypto API. */
export function getRandomBytes(length: number): Bytes {
	const bytes: Bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	return bytes;
}

/**
 * Hash a password using PBKDF2, generating a new salt, and return the combined salt$iterations$hash string.
 *
 * @param password The password to hash.
 * @param iterations The number of iterations.
 *
 * @returns Hash in the format `salt$iterations$hash`, where `salt` and `hash` are base64-encoded.
 * - Returned hash tring will be about 128 characters long (16 byte salt + iteration count + 64 byte hash + 2 separators = 116 characters once base64 encoded).
 */
export async function hashPassword(password: string, iterations = ITERATIONS): Promise<string> {
	// Checks.
	if (password.length < PASSWORD_LENGTH)
		throw new ValueError(`Password must be at least ${PASSWORD_LENGTH} characters long`, {
			received: password.length,
			caller: hashPassword,
		});
	if (iterations < 1) throw new ValueError("Iterations must be number greater than 0", { received: iterations, caller: hashPassword });

	// Hash the password.
	const key = await _getKey(password);
	const salt = getRandomBytes(SALT_LENGTH);
	const bits = HASH_LENGTH * 8;
	const hash = await crypto.subtle.deriveBits({ ...ALGORITHM, salt, iterations }, key, bits);

	// Return the combined string
	return `${encodeBase64URL(salt)}$${iterations}$${encodeBase64URL(hash)}`;
}

/**
 * Verify a password against a stored salt$iterations$hash string using PBKDF2.
 *
 * @param password The password to verify.
 * @param hash String in the format `salt$iterations$hash`, where `salt` and `hash` are base64-encoded.
 *
 * @returns True if the password matches the hash, false otherwise.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	// Check salthash.
	const [s, i, h] = hash.split("$");
	if (!s || !i || !h) return false;
	const hashBytes = decodeBase64URLBytes(h);

	// Check iterations.
	const iterations = Number.parseInt(i, 10);
	if (!Number.isFinite(iterations) || iterations < 1) return false;

	// Derive the hash.
	const key = await _getKey(password);
	const salt = decodeBase64URLBytes(s);
	const bits = hashBytes.length * 8;
	const derivedBytes: Bytes = new Uint8Array(await crypto.subtle.deriveBits({ ...ALGORITHM, salt, iterations }, key, bits));

	// Compare the derived hash with the stored hash.
	return _compareBytes(derivedBytes, hashBytes);
}

/** Compare two sets of bytes using constant time comparison. */
function _compareBytes(left: Bytes, right: Bytes): boolean {
	if (left.length !== right.length) return false;
	let result = 0;
	for (let i = 0; i < left.length; ++i) result |= (left[i] as number) ^ (right[i] as number);
	return result === 0;
}

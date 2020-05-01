import { modPow } from "bigint-crypto-utils";

import { encrypt } from "./encryption";
import { PublicKey } from "./keys";

export const add = ({ n2 }: PublicKey) => (a: bigint, b: bigint): bigint =>
	(a * b) % n2;

export const multiply = (publicKey: PublicKey) => (
	cipherText: bigint,
	plainText: bigint,
): bigint => {
	// Insecure naive multiplication: cipherText^0 % n^2 === 1
	if (plainText === 0n) {
		return encrypt(publicKey)(0n);
	}
	// Insecure naive multiplication: cipherText^1 % n^2 === cipherText
	if (plainText === 1n) {
		const encryptedZero = encrypt(publicKey)(0n);
		return add(publicKey)(cipherText, encryptedZero);
	}
	return modPow(cipherText, plainText, publicKey.n2);
};

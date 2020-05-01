import { modPow, randBetween } from "bigint-crypto-utils";

import { KeyPair, PublicKey } from "./keys";
import { createL } from "./math";

export const encrypt = ({ g, n, n2 }: PublicKey) => (
	plainText: bigint,
): bigint => {
	const r = randBetween(n);
	return (modPow(g, plainText, n2) * modPow(r, n, n2)) % n2;
};

export const decrypt = ({ priv: { lambda, mu }, pub: { n, n2 } }: KeyPair) => (
	cipherText: bigint,
): bigint => {
	const L = createL(n);
	return (L(modPow(cipherText, lambda, n2)) * mu) % n;
};

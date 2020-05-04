import { lcm, modInv, modPow } from "bigint-crypto-utils";

export const calculateLambda = (p: bigint, q: bigint): bigint =>
	lcm(p - 1n, q - 1n);

export const createL = (n: bigint) => (x: bigint): bigint => (x - 1n) / n;

export const calculateMu = (
	g: bigint,
	lambda: bigint,
	n: bigint,
	n2 = n ** 2n,
): bigint => {
	const L = createL(n);
	return modInv(L(modPow(g, lambda, n2)), n);
};

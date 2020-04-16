import { modInv, modPow } from "bigint-crypto-utils";

export const getBitLength = (a: bigint): number =>
	[0n, 1n].includes(a) ? 1 : 1 + getBitLength(a >> 1n);

export const greatestCommonDivisor = (a: bigint, b: bigint): bigint =>
	b === 0n ? a : greatestCommonDivisor(b, a % b);

export const lowestCommonMultiple = (a: bigint, b: bigint): bigint =>
	(a * b) / greatestCommonDivisor(a, b);

export const calculateLambda = (p: bigint, q: bigint): bigint =>
	lowestCommonMultiple(p - 1n, q - 1n);

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

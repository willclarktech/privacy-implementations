import { gcd, modPow } from "bigint-crypto-utils";
import { createHash } from "crypto";

export const getBitLength = (a: bigint): number =>
	[0n, 1n].includes(a) ? 1 : 1 + getBitLength(a >> 1n);

export const getByteLength = (a: bigint): number =>
	Math.ceil(getBitLength(a) / 8);

export const bigInt2Buffer = (a: bigint): Buffer =>
	Buffer.from(a.toString(16), "hex");

export const bigInt2Array = (a: bigint): readonly number[] =>
	Array.from(bigInt2Buffer(a));

export const buffer2BigInt = (a: Buffer): bigint =>
	BigInt(`0x${a.toString("hex")}`);

export const array2BigInt = (a: readonly number[]): bigint =>
	buffer2BigInt(Buffer.from(a));

export const hashNumber = (algorithm: string, n: bigint): bigint => {
	const buffer = Buffer.alloc(8);
	buffer.writeBigUInt64BE(n);

	const hash = createHash(algorithm);
	hash.update(buffer);
	const hashOutput = hash.digest();

	return hashOutput.readBigUInt64BE();
};

export const phi = (n: bigint): bigint => {
	let count = 0n;

	for (let candidate = 1n; candidate < n; ++candidate) {
		if (gcd(n, candidate) === 1n) {
			++count;
		}
	}

	return count;
};

const newtonIteration = (n: bigint, candidate: bigint): bigint => {
	const nextCandidate = (n / candidate + candidate) >> 1n;
	return candidate === nextCandidate || candidate === nextCandidate - 1n
		? candidate + 1n
		: newtonIteration(n, nextCandidate);
};

const getRoughSquareRoot = (n: bigint): bigint => {
	if (n < 0n) {
		throw new Error("Cannot get square root of negative numbers");
	}
	if (n < 2n) {
		return n;
	}
	return newtonIteration(n, 1n);
};

export const getPrimeFactors = (n: bigint): readonly bigint[] => {
	const roughSquareRoot = getRoughSquareRoot(n);
	const primeFactors = [];

	for (let candidate = 2n; candidate <= roughSquareRoot; ++candidate) {
		if (n % candidate === 0n) {
			primeFactors.push(candidate);
		}
	}

	return primeFactors;
};

export const isGenerator = (
	modulus: bigint,
	candidate: bigint,
	totient = phi(modulus),
): boolean => {
	const roughSquareRoot = getRoughSquareRoot(totient);

	for (
		let factorCandidate = 2n;
		factorCandidate <= roughSquareRoot;
		++factorCandidate
	) {
		if (
			totient % factorCandidate === 0n &&
			modPow(candidate, totient / factorCandidate, modulus) === 1n
		) {
			return false;
		}
	}

	return true;
};

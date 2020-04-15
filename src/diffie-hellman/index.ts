import { isProbablyPrime, modPow, randBetween } from "bigint-crypto-utils";

const DEFAULT_BIT_LENGTH = 2048n;

export class Alice {
	public readonly p: bigint;
	public readonly g: bigint;
	private readonly a: bigint;
	private s: null | bigint = null;

	constructor(bitLength = DEFAULT_BIT_LENGTH) {
		const keySpace = 2n ** bitLength;
		this.p = Alice.getP(keySpace);
		this.g = randBetween(this.p - 1n, 2n);
		this.a = randBetween(keySpace);
	}

	public storeSharedSecret(B: bigint): void {
		const { a, p } = this;
		// this.s = B ** a % p;
		this.s = modPow(B, a, p);
	}

	public get A(): bigint {
		const { a, g, p } = this;
		// return g ** a % p;
		return modPow(g, a, p);
	}

	public get sharedSecret(): null | bigint {
		if (process.env.NODE_ENV !== "test") {
			throw new Error("Cannot show shared secret outside test environment");
		}
		return this.s;
	}

	private static getRandomPrime(keySpace: bigint): bigint {
		const candidate = randBetween(keySpace, keySpace / 2n);
		return isProbablyPrime(candidate)
			? candidate
			: Alice.getRandomPrime(keySpace);
	}

	private static getP(
		keySpace: bigint,
		q = Alice.getRandomPrime(keySpace),
	): bigint {
		const r = randBetween(keySpace);
		const p = q * r + 1n;
		return isProbablyPrime(p) ? p : Alice.getP(keySpace, q);
	}
}

export class Bob {
	public readonly p: bigint;
	public readonly g: bigint;
	private readonly b: bigint;
	private s: null | bigint = null;

	public constructor(p: bigint, g: bigint, bitLength = DEFAULT_BIT_LENGTH) {
		const keySpace = 2n ** bitLength;
		this.p = p;
		this.g = g;
		this.b = randBetween(keySpace);
	}

	public storeSharedSecret(A: bigint): void {
		const { b, p } = this;
		// this.s = A ** b % p
		this.s = modPow(A, b, p);
	}

	public get B(): bigint {
		const { b, g, p } = this;
		// return g ** b % p
		return modPow(g, b, p);
	}

	public get sharedSecret(): null | bigint {
		if (process.env.NODE_ENV !== "test") {
			throw new Error("Cannot show shared secret outside test environment");
		}
		return this.s;
	}
}

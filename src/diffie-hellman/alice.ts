import { isProbablyPrime, modPow, randBetween } from "bigint-crypto-utils";

import { DEFAULT_BIT_LENGTH } from "./constants";

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

	public raise(g: bigint): bigint {
		const { a, p } = this;
		return modPow(g, a, p);
	}

	public storeSharedSecret(B: bigint): void {
		this.s = this.raise(B);
	}

	public get A(): bigint {
		return this.raise(this.g);
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

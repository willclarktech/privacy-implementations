import { modPow, randBetween } from "bigint-crypto-utils";

import { DEFAULT_BIT_LENGTH } from "./constants";

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

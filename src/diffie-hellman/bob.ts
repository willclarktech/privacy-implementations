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

	public raise(g: bigint): bigint {
		const { b, p } = this;
		return modPow(g, b, p);
	}

	public storeSharedSecret(A: bigint): void {
		this.s = this.raise(A);
	}

	public get B(): bigint {
		return this.raise(this.g);
	}

	public get sharedSecret(): null | bigint {
		if (process.env.NODE_ENV !== "test") {
			throw new Error("Cannot show shared secret outside test environment");
		}
		return this.s;
	}
}

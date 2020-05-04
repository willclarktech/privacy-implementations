import { isProbablyPrime, modPow, randBetween } from "bigint-crypto-utils";

import { DEFAULT_BIT_LENGTH } from "./constants";

export type PartyOptions = {
	readonly p?: bigint;
	readonly g?: bigint;
	readonly bitLength?: number;
};

export class Party {
	public readonly p: bigint;
	public readonly g: bigint;
	private readonly secret: bigint;

	constructor({ p, g, bitLength = DEFAULT_BIT_LENGTH }: PartyOptions = {}) {
		const keySpace = 2n ** BigInt(bitLength);
		this.p = p === undefined ? Party.getP(keySpace) : p;
		this.g = g === undefined ? randBetween(this.p - 1n, 2n) : g;
		this.secret = randBetween(keySpace);
	}

	public raise(g: bigint): bigint {
		const { secret, p } = this;
		return modPow(g, secret, p);
	}

	public get intermediateValue(): bigint {
		return this.raise(this.g);
	}

	private static getRandomPrime(keySpace: bigint): bigint {
		const candidate = randBetween(keySpace, keySpace / 2n);
		return isProbablyPrime(candidate)
			? candidate
			: Party.getRandomPrime(keySpace);
	}

	private static getP(
		keySpace: bigint,
		q = Party.getRandomPrime(keySpace),
	): bigint {
		const r = randBetween(keySpace);
		const p = q * r + 1n;
		return isProbablyPrime(p) ? p : Party.getP(keySpace, q);
	}
}

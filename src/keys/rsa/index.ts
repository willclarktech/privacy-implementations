import { lcm, modInv, modPow, primeSync } from "bigint-crypto-utils";

import { DEFAULT_BIT_LENGTH, DEFAULT_E } from "./constants";

export type RsaOptions = {
	bitLength?: number;
	e?: bigint;
};

export type RsaPrivateKey = {
	readonly d: bigint;
};

export type RsaPublicKey = {
	readonly e: bigint;
	readonly n: bigint;
};

export class Party {
	private readonly privateKey: RsaPrivateKey;
	public readonly publicKey: RsaPublicKey;

	constructor({
		bitLength = DEFAULT_BIT_LENGTH,
		e = DEFAULT_E,
	}: RsaOptions = {}) {
		if (e <= 1) {
			throw new Error("e must be above 1");
		}

		const p = primeSync(bitLength);
		const q = primeSync(bitLength);
		const n = p * q;
		const lambdaN = lcm(p - 1n, q - 1n);
		if (lambdaN <= e) {
			throw new Error("Bit length too small or e too large");
		}

		const d = modInv(e, lambdaN);
		this.publicKey = { e, n };
		this.privateKey = { d };
	}

	public static encryptForPublicKey(
		plainText: bigint,
		publicKey: RsaPublicKey,
	): bigint {
		return modPow(plainText, publicKey.e, publicKey.n);
	}

	public encrypt(plainText: bigint): bigint {
		return Party.encryptForPublicKey(plainText, this.publicKey);
	}

	public decrypt(cipherText: bigint): bigint {
		return modPow(cipherText, this.privateKey.d, this.publicKey.n);
	}
}

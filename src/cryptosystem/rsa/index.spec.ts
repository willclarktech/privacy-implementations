import { lcm, modInv, modPow } from "bigint-crypto-utils";

import { Party } from "./";

describe("RSA", () => {
	const maxAttackPeriod = 20_000;

	it("successfully generates keys for encryption/decryption", () => {
		const bitLength = 1024;
		const plainText = 12345n;
		const alice = new Party({ bitLength });

		const cipherText = alice.encrypt(plainText);
		const decrypted = alice.decrypt(cipherText);

		expect(decrypted).toStrictEqual(plainText);
	});

	it("can be broken efficiently with small key sizes", () => {
		const bitLength = 16;
		const plainText = 12345n;
		const alice = new Party({ bitLength });
		const { e, n } = alice.publicKey;
		const cipherText = alice.encrypt(plainText);

		let p = 1n;
		let found = false;
		const startTime = Date.now();

		while (!found && Date.now() - startTime < maxAttackPeriod) {
			++p;
			if (n % p === 0n) {
				found = true;
			}
		}

		expect(found).toStrictEqual(true);

		const q = n / p;
		const lambdaN = lcm(p - 1n, q - 1n);
		const d = modInv(e, lambdaN);
		const decrypted = modPow(cipherText, d, n);

		expect(decrypted).toStrictEqual(plainText);
	});

	it("cannot be broken efficiently with large key sizes", () => {
		const bitLength = 32;
		const alice = new Party({ bitLength });
		const { n } = alice.publicKey;

		let p = 1n;
		let found = false;
		const startTime = Date.now();

		while (!found && Date.now() - startTime < maxAttackPeriod) {
			++p;
			if (n % p === 0n) {
				found = true;
			}
		}

		expect(found).toStrictEqual(false);
	});
});

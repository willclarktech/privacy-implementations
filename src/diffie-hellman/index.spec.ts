import { modPow } from "bigint-crypto-utils";

import { Alice, Bob } from "./";

describe("Diffie-Hellman", () => {
	it("successfully completes key exchange", () => {
		const alice = new Alice();
		const bob = new Bob(alice.p, alice.g);

		alice.storeSharedSecret(bob.B);
		bob.storeSharedSecret(alice.A);

		expect(bob.sharedSecret).toStrictEqual(alice.sharedSecret);
		expect(alice.sharedSecret).not.toBeNull();
		expect(alice.sharedSecret).not.toBeNaN();
		expect(alice.sharedSecret).toBeGreaterThanOrEqual(1);
		expect((alice.sharedSecret as bigint) - (alice.p - 1n)).toBeLessThanOrEqual(
			0,
		);
	});

	it("can be broken efficiently with small key sizes", () => {
		const bitLength = 16n;
		const alice = new Alice(bitLength);
		const bob = new Bob(alice.p, alice.g);

		alice.storeSharedSecret(bob.B);
		bob.storeSharedSecret(alice.A);

		const maxAttackPeriod = 20_000;
		const startTime = Date.now();

		let a = 1n;
		const { A, g, p } = alice;

		let found = false;
		while (!found && Date.now() - startTime < maxAttackPeriod) {
			++a;
			if (modPow(g, a, p) === A) {
				found = true;
				break;
			}
		}

		expect(found).toStrictEqual(true);

		const secret = modPow(bob.B, a, p);
		expect(secret).toStrictEqual(alice.sharedSecret);
	});

	it("cannot be broken efficiently with large key sizes", () => {
		const bitLength = 32n;
		const alice = new Alice(bitLength);
		const bob = new Bob(alice.p, alice.g);

		alice.storeSharedSecret(bob.B);
		bob.storeSharedSecret(alice.A);

		const maxAttackPeriod = 20_000;
		const startTime = Date.now();

		const { A, g, p } = alice;

		let a = 1n;
		let found = false;
		while (!found && Date.now() - startTime < maxAttackPeriod) {
			++a;
			if (modPow(g, a, p) === A) {
				found = true;
				break;
			}
		}

		expect(found).toStrictEqual(false);
	});
});

import { modPow } from "bigint-crypto-utils";

import { Party } from "./";

describe("Diffie-Hellman", () => {
	const maxAttackPeriod = 20_000;

	it("successfully completes key exchange", () => {
		const alice = new Party();
		const { g, p } = alice;
		const bob = new Party({ p, g });

		const aliceSharedSecret = alice.raise(bob.intermediateValue);
		const bobSharedSecret = bob.raise(alice.intermediateValue);

		expect(bobSharedSecret).toStrictEqual(aliceSharedSecret);
		expect(aliceSharedSecret).not.toBeNull();
		expect(aliceSharedSecret).not.toBeNaN();
		expect(aliceSharedSecret).toBeGreaterThanOrEqual(1);
		expect((aliceSharedSecret as bigint) - (alice.p - 1n)).toBeLessThanOrEqual(
			0,
		);
	});

	it("can be broken efficiently with small key sizes", () => {
		const bitLength = 16;
		const alice = new Party({ bitLength });
		const { g, p } = alice;
		const bob = new Party({ p, g });

		const aliceSharedSecret = alice.raise(bob.intermediateValue);

		let a = 1n;
		let found = false;
		const startTime = Date.now();

		while (!found && Date.now() - startTime < maxAttackPeriod) {
			++a;
			if (modPow(g, a, p) === alice.intermediateValue) {
				found = true;
				break;
			}
		}

		expect(found).toStrictEqual(true);

		const sharedSecret = modPow(bob.intermediateValue, a, p);
		expect(sharedSecret).toStrictEqual(aliceSharedSecret);
	});

	it("cannot be broken efficiently with large key sizes", () => {
		const bitLength = 32;
		const alice = new Party({ bitLength });
		const { g, p } = alice;

		let a = 1n;
		let found = false;
		const startTime = Date.now();

		while (!found && Date.now() - startTime < maxAttackPeriod) {
			++a;
			if (modPow(g, a, p) === alice.intermediateValue) {
				found = true;
				break;
			}
		}

		expect(found).toStrictEqual(false);
	});
});

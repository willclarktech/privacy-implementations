import { Client, Server } from "./";

describe("Private set intersection based on Paillier", () => {
	it.each([
		[new Set([]), []],
		[new Set([1]), [1]],
		[new Set([1, 6]), [1]],
		[new Set([6, 7]), []],
		[new Set([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]],
		[new Set([1, 2, 3, 4, 5, 6]), [1, 2, 3, 4, 5]],
	])("reveals the intersection", (clientSet, expected) => {
		const serverSet = new Set([1, 2, 3, 4, 5]);
		const server = new Server(serverSet);

		const domainSize = 10;
		const bitLength = 512;
		const client = new Client(domainSize, clientSet, bitLength);

		const values = client.getEncryptedValues();
		const response = server.revealIntersection(client.publicKey, values);
		const actual = client.handleIntersectionResponse(response);

		expect(actual).toStrictEqual(expected);
	});

	it.each([
		[new Set([]), 0n],
		[new Set([1]), 1n],
		[new Set([1, 6]), 1n],
		[new Set([6, 7]), 0n],
		[new Set([1, 2, 3, 4, 5]), 5n],
		[new Set([1, 2, 3, 4, 5, 6]), 5n],
	])("reveals the size of the intersection", (clientSet, expected) => {
		const serverSet = new Set([1, 2, 3, 4, 5]);
		const server = new Server(serverSet);

		const domainSize = 10;
		const bitLength = 512;
		const client = new Client(domainSize, clientSet, bitLength);

		const values = client.getEncryptedValues();
		const response = server.revealIntersectionSize(client.publicKey, values);
		const actual = client.handleIntersectionSizeResponse(response);

		expect(actual).toStrictEqual(expected);
	});

	it.each([
		[new Set([]), false],
		[new Set([1]), true],
		[new Set([1, 6]), true],
		[new Set([6, 7]), false],
		[new Set([1, 2, 3, 4, 5]), true],
		[new Set([1, 2, 3, 4, 5, 6]), true],
	])("reveals whether the intersection is non-empty", (clientSet, expected) => {
		const serverSet = new Set([1, 2, 3, 4, 5]);
		const server = new Server(serverSet);

		const domainSize = 10;
		const bitLength = 512;
		const client = new Client(domainSize, clientSet, bitLength);

		const values = client.getEncryptedValues();
		const response = server.revealIntersectionNonEmpty(
			client.publicKey,
			values,
		);
		const actual = client.handleIntersectionNonEmptyResponse(response);

		expect(actual).toStrictEqual(expected);
	});

	it("is insecure for small domains", () => {
		const serverSet = new Set([1, 2, 3, 4, 5]);
		const server = new Server(serverSet);

		const domainSize = 10;
		const bitLength = 512;
		const clients = [...new Array(domainSize)].map((_, i) => {
			const clientSet = new Set([i]);
			return new Client(domainSize, clientSet, bitLength);
		});

		const clientValuesPairs = clients.map((client) => ({
			client,
			values: client.getEncryptedValues(),
		}));
		const responses = clientValuesPairs.map(({ client, values }) =>
			server.revealIntersectionNonEmpty(client.publicKey, values),
		);
		const reconstructedServerSet = responses.reduce((set, response, i) => {
			const included = clients[i].handleIntersectionNonEmptyResponse(response);
			if (included) {
				set.add(i);
			}
			return set;
		}, new Set());

		expect(reconstructedServerSet).toEqual(serverSet);
	});
});

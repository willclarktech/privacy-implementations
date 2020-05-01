import { Client, Server } from "./";

describe("Private set intersection based on Diffie-Hellman", () => {
	it.each([
		[new Set([]), []],
		[new Set([1]), [1]],
		[new Set([1, 6]), [1]],
		[new Set([6, 7]), []],
		[new Set([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]],
		[new Set([1, 2, 3, 4, 5, 6]), [1, 2, 3, 4, 5]],
	])("reveals the intersection", (clientSet, expected) => {
		const bitLength = 8;
		const serverSet = new Set([1, 2, 3, 4, 5]);
		const server = new Server(serverSet, { bitLength });
		const { p, g } = server;
		const client = new Client(clientSet, { p, g });

		const clientIntermediateValues = client.prepareIntermediateValues();
		const response = server.revealIntersection(clientIntermediateValues);
		const actual = client.handleIntersectionResponse(response);

		expect(actual).toStrictEqual(expected);
	});

	it.each([
		[new Set([]), 0],
		[new Set([1]), 1],
		[new Set([1, 6]), 1],
		[new Set([6, 7]), 0],
		[new Set([1, 2, 3, 4, 5]), 5],
		[new Set([1, 2, 3, 4, 5, 6]), 5],
	])("reveals the size of the intersection", (clientSet, expected) => {
		const bitLength = 8;
		const serverSet = new Set([1, 2, 3, 4, 5]);
		const server = new Server(serverSet, { bitLength });
		const { p, g } = server;
		const client = new Client(clientSet, { p, g });

		const clientIntermediateValues = client.prepareIntermediateSortedValues();
		const response = server.revealIntersectionSize(clientIntermediateValues);
		const actual = client.handleIntersectionSizeResponse(response);

		expect(actual).toStrictEqual(expected);
	});

	it("is insecure for small domains", () => {
		const domainSize = 10;
		const bitLength = 8;
		const serverSet = new Set([1, 2, 3, 4, 5]);
		const server = new Server(serverSet, { bitLength });
		const { p, g } = server;
		const clients = [...new Array(domainSize)].map((_, i) => {
			const clientSet = new Set([i]);
			return new Client(clientSet, { p, g, bitLength });
		});

		const clientIntermediateValues = clients.map((client) =>
			client.prepareIntermediateSortedValues(),
		);
		const responses = clientIntermediateValues.map(
			server.revealIntersectionSize.bind(server),
		);
		const reconstructedServerSet = responses.reduce((set, response, i) => {
			const included = clients[i].handleIntersectionSizeResponse(response);
			if (included) {
				set.add(i);
			}
			return set;
		}, new Set());

		expect(reconstructedServerSet).toEqual(serverSet);
	});
});

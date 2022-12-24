import { Client, Server } from "./";

describe("Private set intersection based on Diffie-Hellman", () => {
	describe.only("without filter", () => {
		it.each([
			[new Set([]), []],
			[new Set([1]), []],
			[new Set([12]), [12]],
			// [new Set([1, 6]), [1]],
			// [new Set([6, 7]), []],
			// [new Set([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]],
			// [new Set([1, 2, 3, 4, 5, 6]), [1, 2, 3, 4, 5]],
			[new Set([3, 6, 9, 12, 15, 18]), [6, 12, 18]],
		])("reveals the intersection", (clientSet, expected) => {
			const bitLength = 8;
			// const serverSet = new Set([1, 2, 3, 4, 5]);
			const serverSet = new Set([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
			const server = new Server(serverSet, { bitLength });
			const { p, g } = server;
			const client = new Client(clientSet, { p, g, bitLength });

			const clientIntermediateValues = client.prepareIntermediateValues();
			const response = server.revealIntersection(clientIntermediateValues);
			const actual = client.handleIntersectionResponse(response);

			expect(actual).toStrictEqual(expected);
			console.log("P", p);
			console.log("CLIENT SET", clientSet);
			console.log("SERVER SET", serverSet);
			console.log("CLIENT INTERMEDIATE", clientIntermediateValues);
			console.log("RESPONSE", response);
			console.log("RESULT", actual);
		});

		// it.each([
		// 	[new Set([]), 0],
		// 	[new Set([1]), 1],
		// 	[new Set([1, 6]), 1],
		// 	[new Set([6, 7]), 0],
		// 	[new Set([1, 2, 3, 4, 5]), 5],
		// 	[new Set([1, 2, 3, 4, 5, 6]), 5],
		// ])("reveals the size of the intersection", (clientSet, expected) => {
		// 	const bitLength = 8;
		// 	const serverSet = new Set([1, 2, 3, 4, 5]);
		// 	const server = new Server(serverSet, { bitLength });
		// 	const { p, g } = server;
		// 	const client = new Client(clientSet, { p, g, bitLength });

		// 	const clientIntermediateValues = client.prepareIntermediateSortedValues();
		// 	const response = server.revealIntersectionSize(clientIntermediateValues);
		// 	const actual = client.handleIntersectionSizeResponse(response);

		// 	expect(actual).toStrictEqual(expected);
		// });

		// it("is insecure for small domains", () => {
		// 	const domainSize = 10;
		// 	const bitLength = 8;
		// 	const serverSet = new Set([1, 2, 3, 4, 5]);
		// 	const server = new Server(serverSet, { bitLength });
		// 	const { p, g } = server;
		// 	const clients = [...new Array(domainSize)].map((_, i) => {
		// 		const clientSet = new Set([i]);
		// 		return new Client(clientSet, { p, g, bitLength });
		// 	});

		// 	const clientIntermediateValues = clients.map((client) =>
		// 		client.prepareIntermediateSortedValues(),
		// 	);
		// 	const responses = clientIntermediateValues.map(
		// 		server.revealIntersectionSize.bind(server),
		// 	);
		// 	const reconstructedServerSet = responses.reduce((set, response, i) => {
		// 		const included = clients[i].handleIntersectionSizeResponse(response);
		// 		if (included) {
		// 			set.add(i);
		// 		}
		// 		return set;
		// 	}, new Set());

		// 	expect(reconstructedServerSet).toEqual(serverSet);
		// });
	});

	describe("with filter", () => {
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
			const client = new Client(clientSet, { p, g, bitLength });

			const clientIntermediateValues = client.prepareIntermediateValues();
			const response = server.revealIntersectionFilter(
				clientIntermediateValues,
			);
			const actual = client.handleIntersectionFilterResponse(response);

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
			const client = new Client(clientSet, { p, g, bitLength });

			const clientIntermediateValues = client.prepareIntermediateSortedValues();
			const response = server.revealIntersectionSizeFilter(
				clientIntermediateValues,
			);
			const actual = client.handleIntersectionSizeFilterResponse(response);

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
				server.revealIntersectionSizeFilter.bind(server),
			);
			const reconstructedServerSet = responses.reduce((set, response, i) => {
				const included =
					clients[i].handleIntersectionSizeFilterResponse(response);
				if (included) {
					set.add(i);
				}
				return set;
			}, new Set());

			expect(reconstructedServerSet).toEqual(serverSet);
		});
	});
});

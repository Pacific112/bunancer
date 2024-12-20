import { type ServerPool } from "./server-pool.ts";

export const startLoadBalancer = (serverPool: ServerPool) => {
	let counter = -1;
	const { servers, requestTo } = serverPool;

	return {
		routeRequest: async (request: Request) => {
			const avServers = servers();
			counter = (counter + 1) % avServers.length;

			const server = avServers[counter];
			return requestTo(server, request);
		},
	};
};

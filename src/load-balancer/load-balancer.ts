import { type ServerPool } from "./server-pool.ts";

export const startLoadBalancer = (serverPool: ServerPool) => {
	let counter = -1;
	const { requestTo } = serverPool;

	return {
		routeRequest: async (request: Request) => {
			return requestTo(request, (servers) => {
				counter = (counter + 1) % servers.length;
				return servers[counter];
			});
		},
	};
};

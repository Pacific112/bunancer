import {initializePool} from "src/load-balancer/server-pool.ts";
import type {AppConfig} from "src/load-balancer/config.ts";

export const startLoadBalancer = (config: AppConfig) => {
	let counter = -1;
	const {servers, requestTo} = initializePool(config.servers);

	return {
		routeRequest: async (request: Request) => {
			const avServers = servers();
			counter = (counter + 1) % avServers.length;

			const server = avServers[counter];
			return requestTo(server, request);
		},
	};
};

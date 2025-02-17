import { type ServerPool } from "load-balancer/src/pool/server-pool.ts";
import { globalEmitter } from "load-balancer/src/global-emitter.ts";
import type { PoolServer } from "load-balancer/src/pool/server.types.ts";

export const startLoadBalancer = (
	serverPool: ServerPool,
	onStateChanged: (servers: PoolServer[]) => void,
) => {
	let counter = -1;
	const { requestTo } = serverPool;

	const storeState = () => onStateChanged(serverPool.status.servers);
	globalEmitter.on("pool:new-server", storeState);
	globalEmitter.on("pool:server-online", storeState);
	globalEmitter.on("pool:server-offline", storeState);
	globalEmitter.on("pool:server-killed", storeState);

	return {
		routeRequest: async (request: Request) => {
			return requestTo(request, (servers) => {
				counter = (counter + 1) % servers.length;
				return servers[counter];
			});
		},
	};
};

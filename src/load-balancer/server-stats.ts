import { globalEmitter } from "load-balancer/global-emitter.ts";
import type { PoolServer } from "load-balancer/server.types.ts";

type ServerStats = {
	totalRequests: number;
};

export const initStats = () => {
	const stats = new Map<string, number>();

	setInterval(() => {
		globalEmitter.emit(
			"pool:stats-update",
			Object.fromEntries(stats.entries()),
		);
	}, 500);

	return {
		stats,
		trackResponse: (response: Response, server: PoolServer) => {
			stats.set(server.id, (stats.get(server.id) || 0) + 1);
		},
	};
};

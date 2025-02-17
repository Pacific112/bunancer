import { globalEmitter } from "@/global-emitter";
import type { PoolServer, ServerStats } from "@/pool/server.types";

const defaultStats = (): ServerStats => ({
	totalRequests: 0,
	requestsPerSecond: 0,
	errorCount: 0,
	errorRate: 0,
	lastRequestTimestamp: Date.now(),
});

const calculateRPS = (currentStats: ServerStats): number => {
	const now = Date.now();
	const timeDiff = (now - currentStats.lastRequestTimestamp) / 1000;
	if (timeDiff === 0) {
		return currentStats.requestsPerSecond;
	}

	// updated for every request so always one
	const newRPS = 1 / timeDiff;
	return currentStats.requestsPerSecond * 0.7 + newRPS * 0.3;
};

export const initStats = () => {
	const stats = new Map<string, ServerStats>();
	const diff = new Map<string, ServerStats>();

	const getStats = (serverId: string) => {
		if (!stats.has(serverId)) {
			stats.set(serverId, defaultStats());
		}
		return stats.get(serverId)!;
	};

	setInterval(() => {
		if (diff.size > 0) {
			globalEmitter.emit("pool:stats-update", Object.fromEntries(diff.entries()));
			diff.clear();
		}
	}, 5000);

	return {
		stats,
		trackResponse: (response: Response, server: PoolServer) => {
			const serverStats = getStats(server.id);

			serverStats.totalRequests += 1;
			serverStats.requestsPerSecond = calculateRPS(serverStats);

			if (!response.ok) {
				serverStats.errorCount += 1;
			}
			serverStats.errorRate =
				serverStats.errorCount / serverStats.totalRequests;

			serverStats.lastRequestTimestamp = Date.now();
			stats.set(server.id, serverStats);
			diff.set(server.id, serverStats);
		},
	};
};

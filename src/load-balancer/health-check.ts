import { type PoolServer, toUrl } from "load-balancer/server.types.ts";

const HEALTH_CHECK_TIMEOUT = 500;
const HEALTH_CHECK_RETRIES_LIMIT = 5;

const callHealthEndpoint = async (server: PoolServer) => {
	try {
		const res = await fetch(`${toUrl(server)}/${server.config.health.path}`, {
			signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT),
		});
		return res.status === 200;
	} catch (e) {
		return false;
	}
};

export const setupHealthCheck = async (
	server: PoolServer,
	onStatusChange: (status: PoolServer["status"]) => void,
) => {
	let currentStatus = server.status;
	let failedCount = 0;

	const getHealthStatus = async () => {
		const result = await callHealthEndpoint(server);

		if (result) {
			return "healthy";
		}
		if (failedCount > HEALTH_CHECK_RETRIES_LIMIT) {
			return "dead";
		}
		return "unhealthy";
	};

	onStatusChange(await getHealthStatus());
	const timerId = setInterval(async () => {
		const newStatus = await getHealthStatus();
		if (newStatus === "healthy") {
			failedCount = 0;
		} else if (newStatus === "dead") {
			clearInterval(timerId);
		} else {
			failedCount++;
		}
		if (newStatus !== currentStatus) {
			currentStatus = newStatus;
			onStatusChange(currentStatus);
		}
	}, server.config.health.interval);
};

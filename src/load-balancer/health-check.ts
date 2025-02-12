import { type PoolServer, toUrl } from "load-balancer/server.types.ts";

const HEALTH_CHECK_TIMEOUT = 500;
const HEALTH_CHECK_RETRIES_LIMIT = 5;
const BASE_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 32000;

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

const calculateBackoff = (failedCount: number): number => {
	const backoff = BASE_BACKOFF_MS * Math.pow(2, failedCount);
	const jitter = backoff * (0.8 + Math.random() * 0.4); //

	return Math.min(jitter, MAX_BACKOFF_MS);
};

export const setupHealthCheck = async (
	server: PoolServer,
	onStatusChange: (status: PoolServer["status"]) => void,
) => {
	let currentStatus = server.status;
	let failedCount = 0;
	let currentTimer: Timer | null = null;

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

	const scheduleNextCheck = () => {
		if (currentTimer) {
			clearTimeout(currentTimer);
		}

		const interval =
			currentStatus === "healthy"
				? server.config.health.interval
				: calculateBackoff(failedCount);

		currentTimer = setTimeout(checkHealth, interval);
	};

	const checkHealth = async () => {
		const newStatus = await getHealthStatus();

		if (newStatus === "healthy") {
			failedCount = 0;
		} else if (newStatus === "dead") {
			if (currentTimer) clearTimeout(currentTimer);
			currentTimer = null;
		} else {
			failedCount++;
		}

		if (newStatus !== currentStatus) {
			currentStatus = newStatus;
			onStatusChange(currentStatus);
		}

		if (currentStatus !== "dead") {
			scheduleNextCheck();
		}
	};

	onStatusChange(await getHealthStatus());
	scheduleNextCheck();
};

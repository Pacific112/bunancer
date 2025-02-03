import type { AppConfig, ServerConfig } from "load-balancer/config-schema.ts";
import { globalEmitter } from "load-balancer/global-emitter.ts";

export const toUrl = ({ config }: PoolServer) =>
	`${config.host}:${config.port}`;

const HEALTH_CHECK_TIMEOUT = 500;
const HEALTH_CHECK_RETRIES_LIMIT = 5;

type BaseServer = { config: ServerConfig; id: string };
export type PendingServer = BaseServer & { status: "pending" };
type HealthyServer = BaseServer & { status: "healthy" };
type UnhealthyServer = BaseServer & { status: "unhealthy" };
type DeadServer = BaseServer & { status: "dead" };
type PoolServer = PendingServer | HealthyServer | UnhealthyServer | DeadServer;

const setupHealthCheck = (
	server: PoolServer,
	onSuccess: (id: string) => void,
	onError: (id: string) => void,
) =>
	setInterval(async () => {
		try {
			console.log("Checking health for: " + server.id)
			const res = await fetch(`${toUrl(server)}/${server.config.health.path}`, {
				signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT),
			});
			if (res.status === 200) {
				onSuccess(server.config.id);
			} else {
				onError(server.config.id);
			}
		} catch (e) {
			onError(server.config.id);
		}
	}, server.config.health.interval);

type HealthCheckInfo = {
	timerId: Timer;
	failedCount: number;
};

const createPool = () => {
	const servers: PoolServer[] = [];
	const healthChecks: Map<string, HealthCheckInfo> = new Map();

	const markAsHealthy = (serverId: string) => {
		const server = servers.find((s) => s.id === serverId);
		if (server) {
			server.status = "healthy";
			healthChecks.get(serverId)!.failedCount = 0;
			globalEmitter.emit("pool:server-online", serverId);
		}
	};
	const markAsDead = (serverId: string) => {
		const server = servers.find((s) => s.id === serverId);
		if (server) {
			server.status = "dead";
			clearInterval(healthChecks.get(serverId)!.timerId);
			globalEmitter.emit("pool:server-killed", serverId);
		}
	};
	const markAsUnhealthy = (serverId: string) => {
		const server = servers.find((s) => s.id === serverId);
		if (server) {
			const failedCount = healthChecks.get(serverId)!.failedCount++;
			if (failedCount >= HEALTH_CHECK_RETRIES_LIMIT) {
				markAsDead(serverId);
				return;
			}

			server.status = "unhealthy";
			globalEmitter.emit("pool:server-offline", serverId);
		}
	};
	return {
		servers,
		addServer: (config: ServerConfig) => {
			const pending = { id: config.id, status: "pending", config } as const;
			servers.push(pending);

			const timerId = setupHealthCheck(pending, markAsHealthy, markAsUnhealthy);
			healthChecks.set(pending.id, { timerId, failedCount: 0 });
			return pending;
		},
		markAsHealthy,
		markAsUnhealthy,
	};
};

export const initializePool = ({ servers: configs, timeout }: AppConfig) => {
	const { servers, markAsUnhealthy, addServer } = createPool();

	configs.forEach(addServer);

	const handleResponse = (response: Response, server: HealthyServer) => {
		if ([502, 503, 504].includes(response.status)) {
			markAsUnhealthy(server.config.id);
		}
	};

	return {
		allServers: servers,
		addServer: (server: ServerConfig) => {
			if (servers.every((s) => s.id !== server.id)) {
				const newServer = addServer(server);
				globalEmitter.emit("pool:new-server", newServer);

				return { ok: true };
			}

			return { ok: false, error: "Server already exists" };
		},
		requestTo: (
			request: Request,
			selector: (servers: HealthyServer[]) => HealthyServer,
		) => {
			const healthyServers = servers.filter((s) => s.status === "healthy");
			const server = selector(healthyServers);
			const fetchPromise = fetch(toUrl(server), {
				body: request.body,
				headers: request.headers,
				signal: timeout ? AbortSignal.timeout(timeout.ms) : undefined,
			});

			fetchPromise
				.then((r) => handleResponse(r, server))
				.catch(() => markAsUnhealthy(server.config.id));

			return fetchPromise;
		},
	};
};

export type ServerPool = ReturnType<typeof initializePool>;

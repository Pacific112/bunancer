import type { AppConfig, ServerConfig } from "load-balancer/src/config/config-schema.ts";
import { globalEmitter } from "load-balancer/src/global-emitter.ts";
import { type HealthyServer, type PoolServer, toUrl } from "load-balancer/src/pool/server.types.ts";
import { initStats } from "load-balancer/src/pool/server-stats.ts";
import { setupHealthCheck } from "load-balancer/src/pool/health-check.ts";

const createPool = (initialServers: PoolServer[]) => {
	const servers: PoolServer[] = [...initialServers];

	const markAsHealthy = (server: PoolServer) => {
		server.status = "healthy";
		globalEmitter.emit("pool:server-online", server.id);
	};
	const markAsDead = (server: PoolServer) => {
		server.status = "dead";
		globalEmitter.emit("pool:server-killed", server.id);
	};
	const markAsUnhealthy = (server: PoolServer) => {
		server.status = "unhealthy";
		globalEmitter.emit("pool:server-offline", server.id);
	};
	return {
		servers,
		addServer: async (config: ServerConfig) => {
			const pending = { id: config.id, status: "pending", config } as const;

			servers.push(pending);
			globalEmitter.emit("pool:new-server", pending);

			setupHealthCheck(pending, (status) => {
				if (status === "healthy") markAsHealthy(pending);
				if (status === "unhealthy") markAsUnhealthy(pending);
				if (status === "dead") markAsDead(pending);
			});

			return pending;
		},
		markAsUnhealthy,
	};
};

export const initializePool = (
	initialServers: PoolServer[],
	{ timeout }: AppConfig,
) => {
	const { stats, trackResponse } = initStats();
	const { servers, markAsUnhealthy, addServer } = createPool(initialServers);

	const handleResponse = (response: Response, server: HealthyServer) => {
		if ([502, 503, 504].includes(response.status)) {
			markAsUnhealthy(server);
		}
	};

	return {
		status: { servers, stats },
		addServer: async (server: ServerConfig) => {
			if (servers.every((s) => s.id !== server.id)) {
				const newServer = await addServer(server);
				if (newServer) {
					return { ok: true };
				}

				return { ok: false, error: "Server health check did not respond" };
			}

			return { ok: false, error: "Server already exists" };
		},
		requestTo: (
			request: Request,
			selector: (servers: HealthyServer[]) => HealthyServer,
		) => {
			const healthyServers = servers.filter((s) => s.status === "healthy");
			if (healthyServers.length === 0) {
				return new Response(undefined, { status: 503 });
			}

			const server = selector(healthyServers);
			const fetchPromise = fetch(toUrl(server), {
				body: request.body,
				headers: request.headers,
				signal: timeout ? AbortSignal.timeout(timeout.ms) : undefined,
			});

			fetchPromise
				.then((r) => {
					handleResponse(r, server);
					trackResponse(r, server);
				})
				.catch(() => markAsUnhealthy(server));

			return fetchPromise;
		},
	};
};

export type ServerPool = ReturnType<typeof initializePool>;

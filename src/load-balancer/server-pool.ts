import type { AppConfig, ServerConfig } from "load-balancer/config-schema.ts";

export const toUrl = (server: ServerConfig) => `${server.host}:${server.port}`;

const HEALTH_CHECK_TIMEOUT = 500;

const setupHealthCheck = (
	server: ServerConfig,
	onSuccess: (id: string) => void,
	onError: (id: string) => void,
) => {
	setInterval(async () => {
		try {
			const res = await fetch(`${toUrl(server)}/${server.health.path}`, {
				signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT),
			});
			if (res.status === 200) {
				onSuccess(server.id);
			} else {
				onError(server.id);
			}
		} catch (e) {
			onError(server.id);
		}
	}, server.health.interval);
};

export const initializePool = ({ servers, timeout }: AppConfig) => {
	const unavailableServers = new Set<string>();

	for (const server of servers) {
		setupHealthCheck(
			server,
			(id) => unavailableServers.delete(id),
			(id) => unavailableServers.add(id),
		);
	}

	const handleResponse = (response: Response, server: ServerConfig) => {
		if ([502, 503, 504].includes(response.status)) {
			unavailableServers.add(server.id);
		}
	};

	return {
		get allServers() {
			return servers.map((s) => ({
				...s,
				status: unavailableServers.has(s.id) ? "offline" : "online",
			}));
		},
		addServer: (server: ServerConfig) => {
			if (servers.every((s) => s.id !== server.id)) {
				servers.push(server);
				setupHealthCheck(
					server,
					(id) => unavailableServers.delete(id),
					(id) => unavailableServers.add(id),
				);

				return { ok: true };
			}

			return { ok: false, error: "Server already exists" };
		},
		requestTo: (
			request: Request,
			selector: (servers: ServerConfig[]) => ServerConfig,
		) => {
			const server = selector(
				servers.filter((s) => !unavailableServers.has(s.id)),
			);
			const fetchPromise = fetch(toUrl(server), {
				body: request.body,
				headers: request.headers,
				signal: timeout ? AbortSignal.timeout(timeout.ms) : undefined,
			});

			fetchPromise
				.then((r) => handleResponse(r, server))
				.catch(() => unavailableServers.add(server.id));

			return fetchPromise;
		},
	};
};

export type ServerPool = ReturnType<typeof initializePool>;

import type { ServerConfig } from "@/config/config-schema";

type BaseServer = { config: ServerConfig; id: string };
export type PendingServer = BaseServer & { status: "pending" };
export type HealthyServer = BaseServer & { status: "healthy" };
export type UnhealthyServer = BaseServer & { status: "unhealthy" };
export type DeadServer = BaseServer & { status: "dead" };
export type PoolServer = PendingServer | HealthyServer | UnhealthyServer | DeadServer;

export const toUrl = ({ config }: PoolServer) =>
	`${config.host}:${config.port}`;

export type ServerStats = {
	totalRequests: number;
	requestsPerSecond: number;
	errorCount: number;
	errorRate: number;
	lastRequestTimestamp: number;
};
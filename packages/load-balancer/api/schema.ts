import z from "zod";

export const serverSchema = z.object({
	id: z.string(),
	name: z.string(),
	status: z.union([
		z.literal("healthy"),
		z.literal("unhealthy"),
		z.literal("pending"),
		z.literal("dead"),
	]),
	ip: z.string(),
});

export type Server = z.infer<typeof serverSchema>;

export const createServerSchema = z.object({
	instanceId: z.string(),
	port: z.string().regex(/\d+/),
});

export type CreateServer = z.infer<typeof createServerSchema>;

export const serverLogsSchema = z.object({
	logs: z.string(),
});

export type ServerLogs = z.infer<typeof serverLogsSchema>;

export interface ServerPool {
	id: string;
	name: string;
	servers: Server[];
}

export const serverStatsSchema = z.object({
	totalRequests: z.number(),
	requestsPerSecond: z.number(),
	errorCount: z.number(),
	errorRate: z.number(),
	lastRequestTimestamp: z.number(),
});

export type ServerStats = z.infer<typeof serverStatsSchema>;

export type NewServerEvent = {
	name: "new-server";
	data: {
		id: string;
		name: string;
		status: "pending";
		ip: string;
	};
};
export type ServerOnlineEvent = { name: "server-online"; data: string };
export type ServerOfflineEvent = { name: "server-offline"; data: string };
export type ServerDeadEvent = { name: "server-dead"; data: string };
export type StatsUpdateEvent = {
	name: "stats-update";
	data: Record<string, ServerStats>;
};
export type ServerEvent =
	| NewServerEvent
	| ServerOnlineEvent
	| ServerOfflineEvent
	| ServerDeadEvent
	| StatsUpdateEvent;

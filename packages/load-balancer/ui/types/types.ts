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

export interface CreateServer {
	instanceId: string;
	port: string;
}

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

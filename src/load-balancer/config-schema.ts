import {z} from "zod";

const serverSchema = z.object({
	id: z.string(),
	host: z.string().url(),
	port: z.string().regex(/\d+/),
	health: z.object({
		path: z.string().startsWith("/"),
		interval: z.number(),
	}),
	timeout: z.optional(
		z.object({
			ms: z.number(),
		}),
	),
});

export const configSchema = z.object({
	servers: z.array(serverSchema),
});

export type AppConfig = z.infer<typeof configSchema>;
export type ServerConfig = AppConfig['servers'][number]
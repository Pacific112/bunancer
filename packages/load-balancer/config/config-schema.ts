import { z } from "zod";

export const serverSchema = z.object({
	id: z.string(),
	host: z.string().url(),
	port: z.string().regex(/\d+/),
	health: z
		.optional(
			z.object({
				path: z.string().startsWith("/"),
				interval: z.number(),
			}),
		)
		.default({ path: "/health", interval: 5000 }),
});

export const configSchema = z.object({
	timeout: z.optional(
		z.object({
			ms: z.number(),
		}),
	),
});

export type AppConfig = z.infer<typeof configSchema>;
export type ServerConfig = z.infer<typeof serverSchema>;

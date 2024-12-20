import { z } from "zod";

const DEFAULT_CONFIG_PATH = "./config.json";

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

const configSchema = z.object({
	servers: z.array(serverSchema),
});

export type AppConfig = z.infer<typeof configSchema>;

export const loadConfig = async () => {
	const path = process.env.CONFIG_PATH || DEFAULT_CONFIG_PATH;
	const file = Bun.file(path, { type: "application/json" });
	if (!(await file.exists())) {
		throw new Error(`File ${path} do not exists`);
	}

	const fileContent = await file.json();
	const parsedConfig = await configSchema.safeParseAsync(fileContent);
	if (parsedConfig.success) {
		return parsedConfig.data;
	}

	throw parsedConfig.error;
};

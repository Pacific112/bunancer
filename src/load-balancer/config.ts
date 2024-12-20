import { configSchema } from "load-balancer/config-schema.ts";

const DEFAULT_CONFIG_PATH = "./config.json";

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

import { type AppConfig, configSchema } from "load-balancer/config-schema.ts";

const path = process.env.CONFIG_PATH || "./config.json";
const configFile = Bun.file(path, { type: "application/json" });

if (!(await configFile.exists())) {
	throw new Error(`Config file ${path} do not exists`);
}

export const loadConfig = async () => {
	const fileContent = await configFile.json();
	const parsedConfig = await configSchema.safeParseAsync(fileContent);
	if (parsedConfig.success) {
		return parsedConfig.data;
	}

	throw parsedConfig.error;
};

export const storeConfig = (config: AppConfig) => {};

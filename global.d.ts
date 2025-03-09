declare module "bun" {
	interface Env {
		SERVER_IDENTIFIER: string;
		CONFIG_PATH?: string;
	}
}

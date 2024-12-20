declare module "bun" {
	interface Env {
		SERVER_IDENTIFIER: number;
		CONFIG_PATH?: string;
	}
}

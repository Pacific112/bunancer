declare module "bun" {
	interface Env {
		SERVER_NUMBER: number;
		CONFIG_PATH?: string
	}
}

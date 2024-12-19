import { program } from "commander";
import { mkdir } from "node:fs/promises";

program.name("stub-server").description("CLI to manage test servers");

program
	.command("run")
	.description("Run a new test server instance")
	.option("-p, --port <number>", "Specify port number")
	.option("-d, --detached", "Detaches process from the parent")
	.action(async (options) => {
		const port =
			options.port || Math.floor(Math.random() * (65535 - 3000) + 3000);
		const instanceId = Math.random().toString(36).substr(2, 9);

		await mkdir("./stubs/logs", { recursive: true })
		const logFile = Bun.file(`./stubs/logs/${instanceId}.log`)


		const proc = Bun.spawn(["bun", `--port=${port}`, "./src/stub-server/server.ts"], {
			stdout: logFile,
			env: {
				...process.env,
				SERVER_NUMBER: instanceId
			}
		})

		if (options.detached) {
			proc.unref()
		}
		proc.ref()


		// await new Promise((resolve, reject) => {
		// 	pm2.connect((err) => {
		// 		if (err) {
		// 			reject(err);
		// 			return;
		// 		}
		//
		// 		pm2.start(
		// 			{
		// 				script: "src/stub-server/index.ts",
		// 				name: `${PM2_APP_NAME}-${instanceId}`,
		// 				interpreter: "bun",
		// 				env: {
		// 					PORT: port.toString(),
		// 					SERVER_NUMBER: instanceId,
		// 					PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`, // Add "~/.bun/bin/bun" to PATH
		// 				},
		// 			},
		// 			(err) => {
		// 				if (err) reject(err);
		// 				else {
		// 					console.log(
		// 						`Server started with ID: ${instanceId} on port: ${port}`,
		// 					);
		// 					resolve(null);
		// 				}
		// 				pm2.disconnect();
		// 			},
		// 		);
		// 	});
		// });
	});

// program
// 	.command("list")
// 	.description("List all running servers")
// 	.action(async () => {
// 		await new Promise((resolve) => {
// 			pm2.connect(() => {
// 				pm2.list((err, list) => {
// 					if (err) {
// 						console.error("Error listing servers:", err);
// 					} else {
// 						const servers = list.filter((p) =>
// 							p.name?.startsWith(PM2_APP_NAME),
// 						);
// 						servers.forEach((p) => {
// 							console.log(
// 								`ID: ${p.name?.split("-")[2]}, PID: ${p.pid}, Status: ${p.pm2_env?.status}`,
// 							);
// 						});
// 					}
// 					pm2.disconnect();
// 					resolve(null);
// 				});
// 			});
// 		});
// 	});

// program
// 	.command('logs')
// 	.argument('<id>', 'Server ID')
// 	.description('Show logs for a specific server')
// 	.action(async (id) => {
// 		await new Promise((resolve) => {
// 			pm2.connect(() => {
// 				pm2.describe(`${PM2_APP_NAME}-${id}`, (err, proc) => {
// 					if (err || !proc.length) {
// 						console.error(`Server ${id} not found`);
// 					} else {
// 						pm2.logs(`${PM2_APP_NAME}-${id}`, {
// 							lines: 1000,
// 							timestamp: true
// 						});
// 					}
// 					resolve(null);
// 				});
// 			});
// 		});
// 	});

// program
// 	.command("stop")
// 	.argument("<id>", "Server ID")
// 	.description("Stop a specific server")
// 	.action(async (id) => {
// 		await new Promise((resolve) => {
// 			pm2.connect(() => {
// 				pm2.delete(`${PM2_APP_NAME}-${id}`, (err) => {
// 					if (err) {
// 						console.error(`Error stopping server ${id}:`, err);
// 					} else {
// 						console.log(`Server ${id} stopped`);
// 					}
// 					pm2.disconnect();
// 					resolve(null);
// 				});
// 			});
// 		});
// 	});

program.parse();

import { program } from "commander";
import { appendFile, mkdir } from "node:fs/promises";

program.name("stub-server").description("CLI to manage test servers");

const STUBS_DIR = "./stubs";
const STUB_LOGS_DIR = `${STUBS_DIR}/logs`;
const STUB_SERVERS_FILE = `${STUBS_DIR}/servers.txt`;
const pathToLogFile = (instanceId: string) =>
	`${STUB_LOGS_DIR}/${instanceId}.log`;

program
	.command("run")
	.description("Run a new test server instance")
	.option("-p, --port <number>", "Specify port number")
	.option("-d, --detached", "Detaches process from the parent")
	.action(async (options) => {
		const port =
			options.port || Math.floor(Math.random() * (65535 - 3000) + 3000);
		const instanceId = Math.random().toString(36).substr(2, 9);

		await mkdir(STUBS_DIR, { recursive: true });
		const logFile = Bun.file(pathToLogFile(instanceId));

		const proc = Bun.spawn(
			["bun", `--port=${port}`, "./src/stub-server/server.ts"],
			{
				stdout: options.detached ? logFile : "inherit",
				env: {
					...process.env,
					SERVER_NUMBER: instanceId,
				},
			},
		);

		await appendFile(STUB_SERVERS_FILE, `${instanceId}|${proc.pid}|${port}\n`);

		if (options.detached) {
			proc.unref();
		}
	});

const loadRunningServers = async () => {
	return (await Bun.file(STUB_SERVERS_FILE).text())
		.split("\n")
		.filter((s) => s.length > 0)
		.map((s) => s.split("|"))
		.map(([instanceId, pid, port]) => ({ instanceId, pid, port }));
};

const isRunning = (
	server: Awaited<ReturnType<typeof loadRunningServers>>[number],
) => {
	try {
		process.kill(Number(server.pid), 0);
		return true;
	} catch (e) {
		return false;
	}
};

const revalidateProcesses = (
	runningServers: Awaited<ReturnType<typeof loadRunningServers>>,
) => {
	const actuallyRunning = runningServers.filter(isRunning);
	const content = actuallyRunning.reduce(
		(s1, { instanceId, pid, port }) => s1 + `${instanceId}|${pid}|${port}\n`,
		"",
	);

	const writer = Bun.file(STUB_SERVERS_FILE).writer();
	writer.write(content);
	writer.flush();

	return actuallyRunning;
};

program
	.command("list")
	.description("List all running servers")
	.action(async () => {
		const runningServers = await loadRunningServers();
		const actuallyRunning = revalidateProcesses(runningServers);

		actuallyRunning.forEach(({ port, pid, instanceId }, index) => {
			console.log(`Server ${index + 1}: ${instanceId} - ${pid} - :${port}`);
		});
	});

program
	.command("logs")
	.argument("<id>", "Server ID")
	.description("Show logs for a specific server")
	.action(async (id) => {
		const runningServers = await loadRunningServers();
		const actuallyRunning = revalidateProcesses(runningServers);

		const wantedServer = actuallyRunning.find(
			({ instanceId }) => instanceId === id,
		);
		if (!wantedServer) {
			console.log("Server not found");
			return;
		}

		console.log(await Bun.file(pathToLogFile(wantedServer.instanceId)).text());
	});

program
	.command("stop")
	.argument("<id>", "Server ID")
	.description("Stop a specific server")
	.action(async (id) => {
		const runningServers = await loadRunningServers();
		const actuallyRunning = revalidateProcesses(runningServers);

		const serverToKill = actuallyRunning.find(
			({ instanceId }) => instanceId === id,
		);
		if (!serverToKill) {
			console.log(`Server ${id} is not running`);
			return;
		}

		if (!isRunning(serverToKill)) {
			console.log(`Server ${id} is not running`);
			return;
		}

		process.kill(Number(serverToKill.pid));
	});

program
	.command("stop-all")
	.description("Stop all servers")
	.action(async () => {
		const runningServers = await loadRunningServers();
		revalidateProcesses(runningServers).forEach(({ pid }) =>
			process.kill(Number(pid)),
		);
	});

program.parse();

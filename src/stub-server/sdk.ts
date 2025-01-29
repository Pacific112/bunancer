import { appendFile, mkdir } from "node:fs/promises";

const STUBS_DIR = "./stubs";
const STUB_LOGS_DIR = `${STUBS_DIR}/logs`;
const STUB_SERVERS_FILE = `${STUBS_DIR}/servers.txt`;
const pathToLogFile = (instanceId: string) =>
	`${STUB_LOGS_DIR}/${instanceId}.log`;

type RunningServer = Awaited<ReturnType<typeof loadRunningServers>>[number];

export const loadRunningServers = async () => {
	return (await Bun.file(STUB_SERVERS_FILE).text())
		.split("\n")
		.filter((s) => s.length > 0)
		.map((s) => s.split("|"))
		.map(([instanceId, pid, port]) => ({ instanceId, pid, port }));
};

export const isRunning = (server: RunningServer) => {
	try {
		process.kill(Number(server.pid), 0);
		return true;
	} catch (e) {
		return false;
	}
};

export const revalidateProcesses = async (runningServers: RunningServer[]) => {
	const actuallyRunning = runningServers.filter(isRunning);
	const content = actuallyRunning.reduce(
		(s1, { instanceId, pid, port }) => s1 + `${instanceId}|${pid}|${port}\n`,
		"",
	);

	await Bun.write(STUB_SERVERS_FILE, content);
	return actuallyRunning;
};

export const runServer = async ({
	instanceId,
	port,
	detached = true,
}: {
	instanceId: string;
	port: string;
	detached?: boolean;
}) => {
	await mkdir(STUBS_DIR, { recursive: true });
	const logFile = Bun.file(pathToLogFile(instanceId), {});
	await Bun.write(logFile, " ");

	const proc = Bun.spawn(
		["bun", `--port=${port}`, "./src/stub-server/server.ts"],
		{
			stdout: detached ? logFile : "inherit",
			env: {
				...process.env,
				SERVER_IDENTIFIER: instanceId,
			},
		},
	);

	await appendFile(STUB_SERVERS_FILE, `${instanceId}|${proc.pid}|${port}\n`);

	if (detached) {
		proc.unref();
	}

	return proc.pid;
};

export const stopAllServers = async (servers: RunningServer[]) => {
	servers.filter(isRunning).forEach(({ pid }) => process.kill(Number(pid)));
	await Bun.write(STUB_SERVERS_FILE, "");
};

export const stopServer = async (server: RunningServer) => {
	if (isRunning(server)) {
		process.kill(Number(server.pid));
		const runningServers = await loadRunningServers();
		await revalidateProcesses(runningServers);
	}
};

export const serverLogs = (server: RunningServer) =>
	Bun.file(pathToLogFile(server.instanceId)).text();

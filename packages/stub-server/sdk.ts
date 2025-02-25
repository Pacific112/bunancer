import { appendFile, mkdir } from "node:fs/promises";
import { log } from "@clack/prompts";

const STUBS_DIR = "./stubs";
const STUB_LOGS_DIR = `${STUBS_DIR}/logs`;
const STUB_SERVERS_FILE = `${STUBS_DIR}/servers.txt`;
const pathToLogFile = (instanceId: string) =>
	`${STUB_LOGS_DIR}/${instanceId}.log`;

const serversFile = Bun.file(STUB_SERVERS_FILE);
if (!(await serversFile.exists())) {
	await mkdir(STUB_LOGS_DIR, { recursive: true });
	await serversFile.write("");
}

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

const findServerById = async (id: string) => {
	const runningServers = await loadRunningServers();
	return runningServers.find((r) => r.instanceId === id);
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

	const path = `${import.meta.dir}/server.ts`;
	const proc = Bun.spawn(["bun", `--port=${port}`, path], {
		stdout: logFile,
		env: {
			...process.env,
			SERVER_IDENTIFIER: instanceId,
		},
	});

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

export const stopServer = async (server: RunningServer | string) => {
	const serverToStop =
		typeof server === "string" ? await findServerById(server) : server;
	if (!serverToStop) return { ok: false };

	if (isRunning(serverToStop)) {
		process.kill(Number(serverToStop.pid));
		const runningServers = await loadRunningServers();
		await revalidateProcesses(runningServers);
	}

	return { ok: true };
};

export const serverLogs = async (server: RunningServer | string) => {
	const selectedServer =
		typeof server === "string" ? await findServerById(server) : server;
	if (!selectedServer) return { ok: false };

	return {
		ok: true,
		data: await Bun.file(pathToLogFile(selectedServer.instanceId)).text(),
	};
};

import { mkdir } from "node:fs/promises";
import { $ } from "bun";
import * as process from "node:process";

const STUBS_DIR = "./stubs";
const STUB_LOGS_DIR = `${STUBS_DIR}/logs`;
const pathToLogFile = (instanceId: string) =>
	`${STUB_LOGS_DIR}/${instanceId}.log`;

type RunningServer = Awaited<ReturnType<typeof loadRunningServers>>[number];

const regex =
	/^(?<pid>\d+)\s+(?<cmd>\S+).+bun --stub-server.*--identifier=(?<identifier>.+) .*--port=(?<port>.*) .*$/;

export const loadRunningServers = async () => {
	const psOutput =
		await $`ps wwxo 'pid,comm,args' | grep "bun --stub-server"`.text();
	return psOutput
		.split("\n")
		.map((p) => regex.exec(p))
		.map((r) => r?.groups)
		.filter((groups) => !!groups)
		.filter((groups) => groups["cmd"] === "bun")
		.map((groups) => ({
			pid: groups["pid"],
			port: groups["port"],
			instanceId: groups["identifier"],
		}));
};

const findServerById = async (id: string) => {
	const runningServers = await loadRunningServers();
	return runningServers.find((r) => r.instanceId === id);
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
	const proc = Bun.spawn(
		[
			"bun",
			"--stub-server",
			`--identifier=${instanceId}`,
			`--port=${port}`,
			path,
		],
		{
			stdout: logFile,
			env: {
				...process.env,
				SERVER_IDENTIFIER: instanceId,
			},
		},
	);

	if (detached) {
		proc.unref();
	}

	return proc.pid;
};

export const stopAllServers = async () => {
	(await loadRunningServers()).forEach(({ pid }) => process.kill(Number(pid)));
};

export const stopServer = async (server: RunningServer | string) => {
	const serverToStop =
		typeof server === "string" ? await findServerById(server) : server;
	if (!serverToStop) return { ok: false };
	process.kill(Number(serverToStop.pid));

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

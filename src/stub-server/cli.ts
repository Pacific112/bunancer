import { program } from "commander";
import { appendFile, mkdir } from "node:fs/promises";
import { cancel, confirm, group, isCancel, select, text } from "@clack/prompts";
import * as crypto from "node:crypto";

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

const revalidateProcesses = async (
	runningServers: Awaited<ReturnType<typeof loadRunningServers>>,
) => {
	const actuallyRunning = runningServers.filter(isRunning);
	const content = actuallyRunning.reduce(
		(s1, { instanceId, pid, port }) => s1 + `${instanceId}|${pid}|${port}\n`,
		"",
	);

	await Bun.write(STUB_SERVERS_FILE, content);
	return actuallyRunning;
};

const runServer = async ({
	instanceId,
	port,
	detached,
}: {
	instanceId: string;
	port: string;
	detached: boolean;
}) => {
	await mkdir(STUBS_DIR, { recursive: true });
	const logFile = Bun.file(pathToLogFile(instanceId));

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

const STUBS_DIR = "./stubs";
const STUB_LOGS_DIR = `${STUBS_DIR}/logs`;
const STUB_SERVERS_FILE = `${STUBS_DIR}/servers.txt`;
const pathToLogFile = (instanceId: string) =>
	`${STUB_LOGS_DIR}/${instanceId}.log`;

program.name("stub-server").description("CLI to manage test servers");

let runningServers = await revalidateProcesses(await loadRunningServers());

while (true) {
	console.clear();

	const options = runningServers.map((s) => ({
		value: s.instanceId,
		label: `[${s.pid}] ${s.instanceId}:${s.port}`,
	}));
	const selectedOption = await select({
		message: "Stub Servers",
		options: [
			...options,
			{ value: "add-new", label: "Add New" },
			{ value: "stop-all", label: "Stop All" },
			{ value: "quit", label: "Quit" },
		],
	});

	if (isCancel(selectedOption)) {
		cancel("Bye bye!");
		break;
	}

	if (selectedOption === "add-new") {
		const port = Math.floor(Math.random() * (65535 - 3000) + 3000) + "";
		const instanceId = crypto.randomUUID().slice(0, 13);
		const config = await group({
			instanceId: () =>
				text({
					message: "Instance ID",
					placeholder: instanceId,
					defaultValue: instanceId,
				}),
			port: () =>
				text({
					message: "Port",
					placeholder: port,
					defaultValue: port,
				}),
			detached: () =>
				text({
					message: "Detached mode (y/n)",
					placeholder: "y",
					defaultValue: "y",
				}),
		});

		const pid = await runServer({
			...config,
			detached: config.detached === "y",
		});
		runningServers.push({ instanceId, pid: pid + "", port });
		runningServers = await loadRunningServers();
		continue;
	}

	if (selectedOption === "stop-all") {
		await confirm({ message: "Are you sure?" });
		runningServers
			.filter(isRunning)
			.forEach(({ pid }) => process.kill(Number(pid)));
		await Bun.write(STUB_SERVERS_FILE, "");
		runningServers = [];
	}
	if (selectedOption === "quit") {
		break;
	}

	console.clear();

	const selectedServer = runningServers.find(
		({ instanceId }) => instanceId === selectedOption,
	);
	if (!selectedServer) {
		continue;
	}
	const option = await select({
		message: `[${selectedServer.pid}] ${selectedServer.instanceId}:${selectedServer.port}`,
		options: [
			{ value: "logs", label: "Logs" },
			{ value: "stop", label: "Stop" },
			{ value: "back", label: "Back" },
		],
	});
	if (option === "logs") {
		console.log(
			await Bun.file(pathToLogFile(selectedServer.instanceId)).text(),
		);
		await confirm({ message: "Continue?" });
	}
	if (option === "stop") {
		if (isRunning(selectedServer)) {
			process.kill(Number(selectedServer.pid));
			await revalidateProcesses(runningServers);
		}
		runningServers = runningServers.filter(
			(r) => r.instanceId !== selectedServer.instanceId,
		);
	}
}

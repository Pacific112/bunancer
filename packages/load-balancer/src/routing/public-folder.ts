import { get } from "@/routing/router.ts";
import type { BuildOutput, BunFile } from "bun";

const MAIN_DIR = Bun.main.replace(/\/[^/]+$/, "");

const cache = async (res: Response, file: BunFile) => {
	const arrayBuffer = await file.arrayBuffer();
	const hash = Bun.hash(arrayBuffer);

	res.headers.set("Cache-Control", "public, max-age=31536000, immutable");
	res.headers.set("ETag", `"${hash}"`);
	res.headers.set("Last-Modified", new Date(file.lastModified).toUTCString());

	return res;
};

export const publicFolder = (
	buildOutput: BuildOutput,
	folder: `/${string}` = "/public",
) =>
	get(`${folder}/:fileName`, ({ pathParams: { fileName } }) => {
		const a = buildOutput.outputs.find((a) => a.path.endsWith(fileName));
		if (a) {
			const file = Bun.file(a.path);
			return cache(new Response(file), file);
		}
		return new Response(null, { status: 404 });
	});

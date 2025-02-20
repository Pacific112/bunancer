import { get } from "@/routing/router.ts";
import type { BunFile } from "bun";

const cache = async (res: Response, file: BunFile) => {
	res.headers.set("Cache-Control", "public, max-age=31536000, immutable");
	res.headers.set(
		"Expires",
		new Date(Date.now() + 31536000 * 1000).toUTCString(),
	);
	res.headers.set("ETag", `W/"${Bun.hash(await file.arrayBuffer())}"`);
	res.headers.set("Last-Modified", new Date(file.lastModified).toUTCString());

	return res;
};

export const publicFolder = (folder = "/public") =>
	get(`${folder}/:fileName`, async ({ pathParams: { fileName } }) => {
		const rootDir = Bun.main.replace("/index.tsx", "");
		const file = Bun.file(`${rootDir}/public/${fileName}`);
		if (await file.exists()) {
			return cache(new Response(file), file);
		}
		return new Response(null, { status: 404 });
	});

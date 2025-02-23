import { get } from "@/routing/router.ts";
import type { BuildArtifact, BuildOutput, BunFile } from "bun";

const cacheHeaders = (file: BunFile, articaft: BuildArtifact) => ({
	"Cache-Control": "public, max-age=31536000, immutable",
	ETag: `"${articaft.hash}"`,
	"Last-Modified": new Date(file.lastModified).toUTCString(),
});

export const publicFolder = (
	buildOutput: BuildOutput,
	folder: `/${string}` = "/public",
) =>
	get(`${folder}/:fileName`, ({ pathParams: { fileName } }) => {
		const a = buildOutput.outputs.find((a) => a.path.endsWith(fileName));
		if (a) {
			const file = Bun.file(a.path);
			return new Response(file, { headers: cacheHeaders(file, a) });
		}
		return new Response(null, { status: 404 });
	});

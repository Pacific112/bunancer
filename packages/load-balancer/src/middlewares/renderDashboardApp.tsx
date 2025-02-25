import type { BuildOutput } from "bun";
import { renderToReadableStream } from "react-dom/server";
import type { ComponentProps, JSXElementConstructor } from "react";

type GroupedOutputs = {
	stylesheets: string[];
	main: string;
};
const categorizeOutputs = (buildResult: BuildOutput) =>
	buildResult.outputs
		.map((o) => o.path)
		.map((p) => p.slice(p.indexOf("/public/")))
		.reduce<GroupedOutputs>(
			(result, filePath) => {
				const assetType = filePath.endsWith(".css") ? "stylesheets" : "main";
				if (assetType === "stylesheets") {
					result[assetType].push(filePath);
				} else {
					result[assetType] = filePath;
				}
				return result;
			},
			{ stylesheets: [], main: "" },
		);

export const renderPage = (
	Page: JSXElementConstructor<any>,
	buildOutput: BuildOutput,
	getProps: (
		request: Request,
	) => Omit<ComponentProps<typeof Page>, "stylesheets">,
) => {
	const groupedOutput = categorizeOutputs(buildOutput);

	return async ({ req }: { req: Request }) => {
		const initialProps = getProps(req);
		const stream = await renderToReadableStream(
			<Page stylesheets={groupedOutput.stylesheets} {...initialProps} />,
			{
				bootstrapModules: [groupedOutput.main],
				bootstrapScriptContent: `window.__INITIAL_PROPS__ = ${JSON.stringify({
					...initialProps,
					stylesheets: groupedOutput.stylesheets,
				})};`,
			},
		);

		return new Response(stream);
	};
};

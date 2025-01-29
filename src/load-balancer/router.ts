import z from "zod";

type Params = {
	req: Request;
	pathParams: Record<string, string>;
};
type Handler = (p: Params) => Response;
type HandlerWithBody<T> = (body: T, p: Params) => Response | Promise<Response>;
type GetRoute = {
	method: "GET";
	path: string;
	handler: Handler;
};
type PostRoute = {
	method: "POST";
	path: string;
	bodySchema: z.ZodTypeAny;
	handler: HandlerWithBody<unknown>;
};
type DeleteRoute = {
	method: "DELETE";
	path: string;
	handler: Handler;
};
type RouteDefinition = GetRoute | PostRoute | DeleteRoute;

type TrieNode = {
	path: string;
	param: boolean;
	route?: RouteDefinition;
	nodes: Map<string, TrieNode>;
};

type TrieRoot = {
	method: RouteDefinition["method"];
	route?: RouteDefinition;
	nodes: Map<string, TrieNode>;
};

export const get = (path: string, handler: Handler): GetRoute => ({
	method: "GET",
	path,
	handler,
});

export const post = <T extends z.ZodTypeAny>(
	path: string,
	bodySchema: T,
	handler: HandlerWithBody<z.infer<T>>,
): PostRoute => ({
	method: "POST",
	path,
	bodySchema,
	handler,
});

export const del = <T extends string>(
	path: T,
	handler: Handler,
): DeleteRoute => {
	return {
		method: "DELETE",
		path,
		handler,
	};
};

const splitPath = (path: string) => path.split("/").filter((p) => p !== "");

const buildTrieRouter = (routes: RouteDefinition[]) => {
	const trie = new Map<RouteDefinition["method"], TrieRoot>();
	for (const route of routes) {
		if (!trie.has(route.method)) {
			trie.set(route.method, { method: route.method, nodes: new Map() });
		}

		let currentNode: TrieRoot | TrieNode = trie.get(route.method)!;
		for (const path of splitPath(route.path)) {
			if (!currentNode.nodes.has(path)) {
				currentNode.nodes.set(path, {
					path,
					nodes: new Map(),
					param: path.startsWith(":"),
				});
			}
			currentNode = currentNode.nodes.get(path)!;
		}

		if (currentNode.route) {
			throw new Error("Duplicated route");
		}
		currentNode.route = route;
	}

	return trie;
};

const findRequestHandler = (
	trieRouter: Map<RouteDefinition["method"], TrieRoot>,
	req: Request,
) => {
	const method = req.method as RouteDefinition["method"];
	const path = new URL(req.url).pathname;
	const pathParts = splitPath(path);

	let currentNode: TrieRoot | TrieNode | undefined = trieRouter.get(method);
	let params: { name: string; position: number }[] = [];
	for (const pathPart of pathParts) {
		if (!currentNode) break;
		currentNode =
			currentNode.nodes.get(pathPart) ??
			currentNode.nodes.values().find((d) => d.param);
		if (currentNode?.param) {
			params.push({
				name: currentNode.path,
				position: pathParts.indexOf(pathPart),
			});
		}
	}

	return [currentNode, params] as const;
};

const extractParamsFromPath = (
	req: Request,
	params: { name: string; position: number }[],
) => {
	const pathParts = splitPath(new URL(req.url).pathname);
	return params.reduce(
		(prev, curr) => ({
			...prev,
			[curr.name.slice(1)]: pathParts[curr.position],
		}),
		{},
	);
};

export const router = (...routes: RouteDefinition[]) => {
	const trieRouter = buildTrieRouter(routes);

	return async (req: Request) => {
		const [reqHandler, params] = findRequestHandler(trieRouter, req);
		if (!reqHandler || !reqHandler.route) {
			return new Response(undefined, { status: 404 });
		}

		const pathParams = extractParamsFromPath(req, params);
		const { route } = reqHandler;
		if (!("bodySchema" in route)) {
			return route.handler({ req, pathParams });
		}

		const jsonBody = await req.json();
		const parsedBody = await route.bodySchema.safeParseAsync(jsonBody);
		if (parsedBody.success) {
			return route.handler(parsedBody.data, { req, pathParams });
		}

		return new Response(`Cannot parse config: ${parsedBody.error.message}`, {
			status: 400,
		});
	};
};

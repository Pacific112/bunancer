import z from "zod";

type ExtractParameters<T extends string> =
	T extends `${string}:${infer PARAM}/${infer REST}`
		? PARAM | ExtractParameters<REST>
		: T extends `${string}:${infer PARAM}`
			? PARAM
			: never;
type ExtractPathParams<T extends string> = Record<ExtractParameters<T>, string>

type Params<PATH extends string> = {
	req: Request;
	pathParams: ExtractPathParams<PATH>;
};
type Handler<PATH extends string> = (p: Params<PATH>) => Response | Promise<Response>;
type HandlerWithBody<T, PATH extends string> = (body: T, p: Params<PATH>) => Response | Promise<Response>;
type GetRoute<PATH extends string> = {
	method: "GET";
	path: string;
	handler: Handler<PATH>;
};
type PostRoute<PATH extends string> = {
	method: "POST";
	path: string;
	bodySchema: z.ZodTypeAny;
	handler: HandlerWithBody<unknown, PATH>;
};
type DeleteRoute<PATH extends string> = {
	method: "DELETE";
	path: string;
	handler: Handler<PATH>;
};
type RouteDefinition<PATH extends string> = GetRoute<PATH> | PostRoute<PATH> | DeleteRoute<PATH>;

type TrieNode<PATH extends string> = {
	path: string;
	param: boolean;
	route?: RouteDefinition<PATH>;
	nodes: Map<string, TrieNode<PATH>>;
};

type TrieRoot<PATH extends string> = {
	method: RouteDefinition<PATH>["method"];
	route?: RouteDefinition<PATH>;
	nodes: Map<string, TrieNode<PATH>>;
};

export const get = <PATH extends string>(path: PATH, handler: Handler<PATH>): GetRoute<PATH> => ({
	method: "GET",
	path,
	handler,
});

export const post = <BODY extends z.ZodTypeAny, PATH extends string>(
	path: PATH,
	bodySchema: BODY,
	handler: HandlerWithBody<z.infer<BODY>, PATH>,
): PostRoute<PATH> => ({
	method: "POST",
	path,
	bodySchema,
	handler,
});

export const destroy = <PATH extends string>(
	path: PATH,
	handler: Handler<PATH>,
): DeleteRoute<PATH> => ({
	method: "DELETE",
	path,
	handler,
});

const splitPath = (path: string) => path.split("/").filter((p) => p !== "");

const buildTrieRouter = (routes: RouteDefinition<string>[]) => {
	const trie = new Map<RouteDefinition<string>["method"], TrieRoot<string>>();
	for (const route of routes) {
		if (!trie.has(route.method)) {
			trie.set(route.method, {method: route.method, nodes: new Map()});
		}

		let currentNode: TrieRoot<string> | TrieNode<string> = trie.get(route.method)!;
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
	trieRouter: Map<RouteDefinition<string>["method"], TrieRoot<string>>,
	req: Request,
) => {
	const method = req.method as RouteDefinition<string>["method"];
	const path = new URL(req.url).pathname;
	const pathParts = splitPath(path);

	let currentNode: TrieRoot<string> | TrieNode<string> | undefined = trieRouter.get(method);
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

export const router = (...routes: RouteDefinition<string>[]) => {
	const trieRouter = buildTrieRouter(routes);

	return async (req: Request) => {
		const [reqHandler, params] = findRequestHandler(trieRouter, req);
		if (!reqHandler || !reqHandler.route) {
			return new Response(undefined, {status: 404});
		}

		const pathParams = extractParamsFromPath(req, params);
		const {route} = reqHandler;
		if (!("bodySchema" in route)) {
			return route.handler({req, pathParams});
		}

		const jsonBody = await req.json();
		const parsedBody = await route.bodySchema.safeParseAsync(jsonBody);
		if (parsedBody.success) {
			return route.handler(parsedBody.data, {req, pathParams});
		}

		return new Response(`Cannot parse config: ${parsedBody.error.message}`, {
			status: 400,
		});
	};
};

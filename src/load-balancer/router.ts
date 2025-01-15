import z from "zod";

type Params = {
	req: Request;
};
type Handler = (p: Params) => Response;
type HandlerWithBody<T> = (body: T, p: Params) => Response;
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
type RouteDefinition = GetRoute | PostRoute;

type TrieNode = {
	path: string;
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
				currentNode.nodes.set(path, { path, nodes: new Map() });
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
	for (const pathPart of pathParts) {
		if (!currentNode) break;
		currentNode = currentNode.nodes.get(pathPart);
	}

	return currentNode;
};

export const router = (...routes: RouteDefinition[]) => {
	const trieRouter = buildTrieRouter(routes);

	return async (req: Request) => {
		const reqHandler = findRequestHandler(trieRouter, req);
		if (!reqHandler || !reqHandler.route) {
			return new Response(undefined, { status: 404 });
		}

		const { route } = reqHandler;
		if (!("bodySchema" in route)) {
			return route.handler({ req });
		}

		const jsonBody = await req.json()
		const parsedBody = await route.bodySchema.safeParseAsync(jsonBody);
		if (parsedBody.success) {
			return route.handler(parsedBody.data, { req });
		}

		return new Response(`Cannot parse config: ${parsedBody.error.message}`, {
			status: 400,
		});
	};
};

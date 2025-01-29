type RequestHandler = (req: Request) => Promise<Response>;

const applyCorsHeaders = (res: Response) => {
	res.headers.set("Access-Control-Allow-Origin", "*");
	res.headers.set(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, OPTIONS",
	);

	return res
}

export const cors = (handle: RequestHandler): RequestHandler => {
	return async (req) => {
		if (req.method === "OPTIONS") {
			return applyCorsHeaders(new Response)
		}

		const res = await handle(req);
		return applyCorsHeaders(res);
	};
};

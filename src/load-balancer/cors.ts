type RequestHandler = (req: Request) => Promise<Response>;

export const cors = (handle: RequestHandler): RequestHandler => {
	return async (req) => {
		const res = await handle(req);
		res.headers.set("Access-Control-Allow-Origin", "*");
		res.headers.set(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, DELETE, OPTIONS",
		);

		return res;
	};
};

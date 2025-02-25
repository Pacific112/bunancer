import cookie from "cookie";
import * as process from "node:process";
import cookieSignature from "cookie-signature";

type RequestHandler = (req: Request) => Promise<Response>;

const WHITELISTED_COOKIES = ["zw265g9iz4wmidllyhmadrxg"];

const isAllowedWithoutAuth = (path: string, allowedPath: string) => {
	if (allowedPath.endsWith("*")) {
		return path.startsWith(allowedPath.replace("*", ""));
	}

	return path === allowedPath;
};

const COOKIE_NAME = "bcer_token";
const COOKIE_SECRET = process.env.COOKIE_SECRET!;
export const serializeAuthCookie = (value: string) => {
	return cookie.serialize(
		COOKIE_NAME,
		cookieSignature.sign(value, COOKIE_SECRET),
		{ httpOnly: true, sameSite: "lax", maxAge: 2000, path: "/" },
	);
};
export const parseAuthCookie = (cookieString: string) => {
	const auth = cookie.parse(cookieString)[COOKIE_NAME];
	if (!auth) {
		return null;
	}

	return cookieSignature.unsign(auth, COOKIE_SECRET);
};

export const auth = (
	allowedPaths: string[],
	handle: RequestHandler,
): RequestHandler => {
	return async (req) => {
		if (process.env.NODE_ENV === "development") {
			return handle(req);
		}

		const path = new URL(req.url).pathname;
		if (allowedPaths.some((a) => isAllowedWithoutAuth(path, a))) {
			return handle(req);
		}

		const cookieHeader = req.headers.get("Cookie");
		if (!cookieHeader) {
			return new Response(undefined, {
				status: 302,
				headers: { Location: "/unauthorized" },
			});
		}
		const auth = parseAuthCookie(cookieHeader);
		if (!auth || !WHITELISTED_COOKIES.includes(auth)) {
			return new Response(undefined, {
				status: 302,
				headers: { Location: "/unauthorized" },
			});
		}

		return handle(req);
	};
};

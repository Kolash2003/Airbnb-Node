import { NextFunction, Request, Response } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { serverConfig } from "../config";
import { ForbiddenError, UnauthorizedError } from "../utils/errors/app.error";

export type AuthUser = { id: number; email: string };

/** Verifies an AuthinGo HS256 token. Returns null for anything invalid or expired. */
export function verifyJwt(token: string, secret: string): AuthUser | null {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature || !secret) return null;
    try {
        if (JSON.parse(Buffer.from(header, "base64url").toString()).alg !== "HS256") return null;
        const expected = createHmac("sha256", secret).update(`${header}.${payload}`).digest();
        const actual = Buffer.from(signature, "base64url");
        if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
        const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
        if (typeof claims.exp !== "number" || claims.exp * 1000 < Date.now()) return null;
        if (typeof claims.id !== "number" || typeof claims.email !== "string") return null;
        return { id: claims.id, email: claims.email };
    } catch {
        return null;
    }
}

/** Puts the caller on res.locals.user; 401 without a valid Bearer token. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace(/^Bearer /, "") ?? "";
    const user = verifyJwt(token, serverConfig.JWT_SECRET);
    if (!user) throw new UnauthorizedError("Sign in required");
    res.locals.user = user;
    next();
}

/** Roles live in AuthinGo and are not in the token, so ask it. Use after requireAuth. */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const { id } = res.locals.user as AuthUser;
    const response = await fetch(`${serverConfig.AUTH_SERVICE_URL}/users/${id}/roles`, {
        headers: { Authorization: req.headers.authorization! },
    });
    const body = await response.json().catch(() => null);
    // Go's Role struct has no json tags, so the key is "Name".
    const roles: Array<{ Name?: string; name?: string }> = Array.isArray(body?.data) ? body.data : [];
    if (!roles.some((r) => (r.Name ?? r.name) === "admin")) throw new ForbiddenError("Admins only");
    next();
}

/** Service-to-service calls (Bookingservice) carry a shared key instead of a user token. */
export function requireInternalKey(req: Request, res: Response, next: NextFunction) {
    const key = req.headers["x-internal-key"];
    if (!serverConfig.INTERNAL_API_KEY || key !== serverConfig.INTERNAL_API_KEY) {
        throw new UnauthorizedError("Invalid internal key");
    }
    next();
}

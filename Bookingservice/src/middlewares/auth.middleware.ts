import { NextFunction, Request, Response } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { serverConfig } from "../config";
import { UnauthorizedError } from "../utils/errors/app.error";

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

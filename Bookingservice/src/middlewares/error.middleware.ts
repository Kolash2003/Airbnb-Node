import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors/app.error";

export const appErrorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {

    console.log(err);

    // Raw errors (Prisma, Sequelize, etc.) don't carry a statusCode; treat them
    // as 500 instead of crashing the handler with an invalid status code.
    const status = typeof err?.statusCode === "number" ? err.statusCode : 500;

    res.status(status).json({
        success: false,
        message: err?.message || "Internal Server Error"
    });
}

export const genericErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
}
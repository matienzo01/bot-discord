import {
  Middleware,
  ExpressErrorMiddlewareInterface,
} from "routing-controllers";
import { Request, Response, NextFunction } from "express";
import { injectable } from "inversify";

@injectable()
@Middleware({ type: "after" })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (error.name === "AuthorizationRequiredError") {
      res.status(401).send({
        message: "Unauthorized"
      });
    } else {
      // Otro manejo de errores
      res.status(error.httpCode || 500).json({
        message: error.message,
      });
    }
  }
}
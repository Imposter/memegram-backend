import * as HttpStatus from "http-status-codes";
import { Middleware, ExpressErrorMiddlewareInterface } from "routing-controllers";
import { Request, Response } from "express";
import { getLogger } from "log4js";

const log = getLogger("CustomErrorHandler");

@Middleware({ type: "after" })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {
    error(error: any, request: Request, response: Response, next: (error: any) => any) {
        var httpCode = error.httpCode || HttpStatus.INTERNAL_SERVER_ERROR;
        var statusCode = httpCode;
        if (error.code != null) {
            statusCode = error.code;
        } else if (error.message == null) {
            error.message = HttpStatus.getStatusText(httpCode);
		}

        // Log error
        log.debug(`Request Error: Failed to process request from ${request.connection.remoteAddress}:${request.connection.remotePort} with error ${statusCode}: ${error.message}`);
        log.debug(error);

        // Send response
        response.header("Content-Type", "application/json")
            .status(httpCode)
            .send(JSON.stringify({
                code: statusCode,
                error: error.message
            }));
    }
}
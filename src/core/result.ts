import * as HttpStatus from "http-status-codes";
import { HttpError } from "routing-controllers";

export enum ResultCode {
    Ok = 1000,
    InternalError = 1001,
    Unauthorized = 1002,
    
    // User component
    InvalidUserId = 1100,
    InvalidCredentials = 1101,
    AlreadyAuthenticated = 1102,
    UserAlreadyExists = 1103,
    
    // ...

    NotImplemented = 9999
}

export class Result {
    private code: ResultCode;
    private data: any;

    constructor(code: ResultCode, data?: any, convert?: boolean) {
        this.code = code;
        this.data = convert ? Result.toJSONArray(data) : data;
    }

    private static toJSONArray(elems: any[]) {
        var result = [];
        elems.forEach(element => {
            if (Array.isArray(element)) {
                result.push(Result.toJSONArray(element));
            } else {
                result.push(element.toJSON());
            }
        });
        return result;
    }
}

export class ResultError extends HttpError {
    private code: ResultCode;

    constructor(code: ResultCode, message?: string) {
        super(HttpStatus.OK, message);

        this.code = code;
    }
}
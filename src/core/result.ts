import * as HttpStatus from "http-status-codes";
import { HttpError } from "routing-controllers";

export enum ResultCode {
    Ok = 1000,
    InternalError = 1001,

    // Post component
    InvalidPostId = 1100,
    InvalidCaptionTooLong = 1101,

    // Comment component
    InvalidCommentTooLong = 1201,


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
        for (var i = 0; i < elems.length; i++) {
            var element = elems[i];
            if (Array.isArray(element)) {
                result.push(Result.toJSONArray(element));
            } else {
                result.push(element.toJSON());
            }
        };
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
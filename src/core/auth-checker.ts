import * as express from "express";
import { Action } from "routing-controllers";
import { SessionData } from "../models/session";
import { getLogger } from "log4js";

var log = getLogger("AuthChecker");

export async function AuthChecker(action: Action, roles: any[]): Promise<boolean> {
    var request: express.Request = action.request;
    var token = request.headers["authorization"];

    // Check if session exists
    var session = (request.session as SessionData).data;
    if (session != null && session.authorized) {
        // Check role
        if (!roles.length)
            return true;
        if (roles.indexOf(session.role) > 0)
            return true;

        return false;
    }

    // Session does not exist
    return false;
}
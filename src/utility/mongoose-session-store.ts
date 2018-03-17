import * as express from "express";
import * as session from "express-session";
import * as util from "util";
import * as events from "events";
import { Sessions, Session, SessionInfo, SessionData } from "../models/session";

export class MongooseSessionStore extends events.EventEmitter {
    public async get(sid: string, callback: (err: any, session: Express.SessionData) => void) {
        try {
            var session = await Sessions.findOne({ sid: sid });
            if (!session) {
                callback(new Error("Session does not exist"), null);
            } else {
                callback(null, session.data);
            }
        } catch (error) {
            callback(error, null);
        }
    }

    public async set(sid: string, session: Express.Session, callback: (err: any) => void) {
        try {
            await Sessions.create({
                sid: sid,
                data: session,
                expires: session.cookie.expires
            });

            callback(null);
        } catch (error) {
            callback(error);
        }
    }
    
    public async destroy(sid: string, callback: (err: any) => void) {
        try {
            await Sessions.findOneAndRemove({ sid: sid });
            callback(null);
        } catch (error) {
            callback(error);
        }
    }

    public async touch(sid: string, session: Express.Session, callback: (err: any) => void) {
        try {
            await Sessions.findOneAndUpdate({ sid: sid }, { expires: session.cookie.expires });
            callback(null);
        } catch (error) {
            callback(error);
        }
    }

    // Optional
    all: (callback: (err: any, obj: { [sid: string]: Express.SessionData; }) => void) => void;
    length: (callback: (err: any, length: number) => void) => void;
    clear: (callback: (err: any) => void) => void;

    regenerate: (req: express.Request, fn: (err: any) => any) => void;
    load: (sid: string, fn: (err: any, session: Express.Session) => any) => void;
    createSession: (req: express.Request, sess: Express.SessionData) => void;
}

// Inherit from Session Store
util.inherits(MongooseSessionStore, session.Store);
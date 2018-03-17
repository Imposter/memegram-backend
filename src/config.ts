import * as log4js from "log4js";
import * as config from "config";

export interface ExpressConfig {
    port: number;
    secure?: boolean;
    cert?: string;
    key?: string;
    behindProxy?: boolean;
}

export interface SessionConfig {
    secret: string;
    timeout: number;
}

export interface MongoConfig {
    server: string;
    port: number;
    database: string;
    user?: string;
    password?: string;
}

export interface Config {
    express: ExpressConfig;
    session: SessionConfig;
    mongo: MongoConfig;
    log: log4js.Configuration;
}

export function getConfig(): Config {
    return <Config> {
        express: config.get<ExpressConfig>("express"),
        session: config.get<SessionConfig>("session"),
        mongo: config.get<MongoConfig>("mongo"),
        log: config.get<log4js.Configuration>("log")
    };
}
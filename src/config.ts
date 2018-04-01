import * as log4js from "log4js";
import * as config from "config";

export interface AppConfig {
	namesFile: string;
    hashAlgorithm: number;
    postCharacterLimit: number;
    mostPopularTime: number;
}

export interface ExpressConfig {
    port: number;
    secure?: boolean;
    cert?: string;
    key?: string;
    behindProxy?: boolean;
}

export interface MongoServerConfig {
	host: string;
    port: number;
}

export interface MongoConfig {
    servers: MongoServerConfig[];
    secure?: boolean;
    replica?: boolean;
    database: string;
    user?: string;
    password?: string;
}

export interface Config {
    app: AppConfig;
    express: ExpressConfig;
    mongo: MongoConfig;
    log: log4js.Configuration;
}

export function getConfig(): Config {
    return <Config>{
        app: config.get<AppConfig>("app"),
        express: config.get<ExpressConfig>("express"),
        mongo: config.get<MongoConfig>("mongo"),
        log: config.get<log4js.Configuration>("log")
    };
}
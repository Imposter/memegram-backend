import * as log4js from "log4js";
import * as mongoose from "mongoose";
import * as cachegoose from "cachegoose";
import * as express from "express";
import * as session from "express-session";
import * as uuid from "uuid";
import * as cors from "cors";
import * as ms from "express-mongo-sanitize";
import * as rc from "routing-controllers";
import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import { getConfig, Config } from "./config";
import { Schema } from "./database/schema";
import { AuthChecker } from "./core/auth-checker";
import { HashAlgorithm } from "./models/common";
import { User, Users } from "./models/user";
import { MongooseSessionStore } from "./utility/mongoose-session-store";

(async () => {
    // Get environment
    var environment = process.env.NODE_ENV || "dev";

    // Get config
    var config: Config = null;
    try {
        config = getConfig();
    } catch (error) {
        console.log(`FATAL ERROR: Failed to read configuration: ${error}`);
        return;
    }

    // Initialize logger
    log4js.configure(config.log);
    var log = log4js.getLogger("Main");

    // Configure mongoose to use global promises
	(mongoose as any).Promise = global.Promise;

    // Connect to MongoDB server
    var connectionString = `mongodb://${config.mongo.server}:${config.mongo.port}/${config.mongo.database}`;
    try {
        var options: mongoose.ConnectionOptions = { useMongoClient: true };
        if (config.mongo.user) {
            options.user = config.mongo.user;
            options.pass = config.mongo.password;
        }

        await mongoose.connect(connectionString, options);
        log.info(`Connected to MongoDB: ${config.mongo.server}:${config.mongo.port}`);
    } catch (error) {
        log.error(`Failed to connect to MongoDB: ${error}`);
        return;
    }

    // Connect to Redis cache
    

    // Create Express instance
    var app = express();

    // Trust proxy if behind one
    app.set("trust proxy", true);

    // Set up middlewares
    app.use((error: Error, request: express.Request, response: express.Response, next: (error: any) => any) => {
        log.error(`Express error: ${error.stack}`);
        next(error);
    });
    app.use(ms());
    app.use(session({
        genid: () => uuid.v4(),
        secret: config.session.secret,
        resave: false,
        unset: "destroy",
        saveUninitialized: false,
        name: "session_id",
        cookie: {
            secure: config.express.secure || config.express.behindProxy,
            maxAge: config.session.timeout
        },
        store: new MongooseSessionStore()
    }));
    
    // Apply routing config to express app
    rc.useExpressServer(app, {
        controllers: [ `${__dirname}/controllers/**/*.js` ],
        middlewares: [ `${__dirname}/middlewares/**/*.js` ],
        routePrefix: "/api",
        cors: true,
        authorizationChecker: AuthChecker,
        defaultErrorHandler: false,
        development: environment === "dev",
        defaults: {
            paramOptions: {
                // Require request parameters
                required: true
            }	
        }
    });
    
    // Create HTTP server
    var server = null;
    if (!config.express.secure) {
    	server = http.createServer(app);
    } else {
    	var key = config.express.key == null ? new Buffer("") : fs.readFileSync(config.express.key);
        var cert = config.express.cert == null ? new Buffer("") : fs.readFileSync(config.express.cert);
        
        server = https.createServer({
            key: key,
            cert: cert,
            requestCert: true
        }, app);
    }

    // Start listening on port
    server.listen(config.express.port);
    
    log.info(`Server is running on port ${config.express.port}`);
})();
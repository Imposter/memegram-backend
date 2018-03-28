import * as uuid from "uuid";
import { getConfig } from "../config";
import { Result, ResultError, ResultCode } from "../core/result";
import { JsonController, Get, Post, Delete, Authorized, BodyParam, Session, InternalServerError } from "routing-controllers";
import { Users, User } from "../models/user";
import { SessionData } from "../models/session";
import { AuthCreateResult } from "./results/auth";
import { HashAlgorithm, RoleType } from "../core/common";
import { hash1 } from "../core/hash";

const Config = getConfig();

@JsonController("/auth")
export default class AuthController {
    @Post("/create")
    async create(@Session() session: SessionData,
        @BodyParam("email") email: string,
        @BodyParam("name") name: string,
        @BodyParam("password") password: string) {
        // Check if a session already exists (return failure)
        if (session.authorized) {
            return new Result(ResultCode.AlreadyAuthenticated, <AuthCreateResult>{
                name: session.user.name,
                email: session.user.email,
                role: session.user.role
            });
        }

        // Check if an account already exists with either the username or email supplied
        var user = await Users.findOne({
            $or: [{ name: name }, { email: email }]
        });

        if (user) {
            return new Result(ResultCode.UserAlreadyExists);
        }

        // Generate salt
        var salt = uuid.v4();

        // Calculate hash
        var hash: string = null;
        var hashAlg = Config.app.hashAlgorithm;
        if (hashAlg == HashAlgorithm.Hash1) {
            hash = hash1(salt, email, name, password);
        }

        // If no hash was calculated, there is a configuration error
        if (!hash) {
            throw new InternalServerError("Unable to compute password hash, configuration error!");
        }

        // Create user and store in database
        user = await Users.create(<User>{
            name: name,
            email: email,
            passwordHashAlg: hashAlg,
            passwordHash: hash,
            passwordSalt: salt,
            role: RoleType.User
        });

        // Create session
        session.authorized = true;
        session.user = user;

        return new Result(ResultCode.Ok, <AuthCreateResult>{
            name: session.user.name,
            email: session.user.email,
            role: session.user.role
        });
    }

    @Post("/checkName")
    async checkName(@Session() session: SessionData,
        @BodyParam("name") name: string) {
        // Check if session data already exists
        if (session.authorized) {
            return new Result(ResultCode.AlreadyAuthenticated);
        }

        // Check if an account already exists with the specified username
        var user = await Users.findOne({ name: name });
        if (user) {
            return new Result(ResultCode.UserAlreadyExists);
        }
		
		return new Result(ResultCode.UserAvailable);
    }

    @Post("/checkEmail")
    async checkEmail(@Session() session: SessionData,
        @BodyParam("email") email: string) {
        // Check if session data already exists
        if (session.authorized) {
            return new Result(ResultCode.AlreadyAuthenticated);
        }

        // Check if an account already exists with the specified email
        var user = await Users.findOne({ email: email });
        if (user) {
            return new Result(ResultCode.UserAlreadyExists);
		}
		
		return new Result(ResultCode.UserAvailable);
    }

    @Post("/login")
    async login(@Session() session: SessionData,
        @BodyParam("email") email: string,
        @BodyParam("password") password: string) {
        // Check if session data exists (return previous session)
        if (session.authorized) {
            return new Result(ResultCode.AlreadyAuthenticated, <AuthCreateResult>{
                name: session.user.name,
                email: session.user.email,
                role: session.user.role
            });
		}
		
		// Get user
		var user = await Users.findOne({ email: email });
        if (!user) {
            return new Result(ResultCode.InvalidCredentials);
        }

		// Calculate hash
        var hash: string = null;
        var hashAlg = Config.app.hashAlgorithm;
        if (hashAlg == HashAlgorithm.Hash1) {
            hash = hash1(user.passwordSalt, user.email, user.name, password);
        }

        // If no hash was calculated, there is a configuration error
        if (!hash) {
            throw new InternalServerError("Unable to compute password hash, configuration error!");
		}
		
		if (hash == user.passwordHash) {
            // Create session
            session.authorized = true;
            session.user = user;

            return new Result(ResultCode.Ok, <AuthCreateResult>{
                name: session.user.name,
                email: session.user.email,
                role: session.user.role
            });
        } else {
            return new Result(ResultCode.InvalidCredentials);
        }
	}
	
	@Get("/test")
	test() {
		throw new ResultError(ResultCode.Ok, "POOSI");
	}

    @Authorized()
    @Delete("/logout")
    delete(@Session() session: SessionData) {
        session.authorized = false;
        session.user = null;
        session.loginAttempts = 0;

        return new Result(ResultCode.Ok);
    }
}
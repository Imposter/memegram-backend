import * as uuid from "uuid";
import { getConfig } from "../config";
import { Result, ResultError, ResultCode } from "../core/result";
import { JsonController, Get, Post, Delete, Authorized, BodyParam, Session, InternalServerError } from "routing-controllers";
import { Users, User } from "../models/user";
import { SessionData } from "../models/session";
import { AuthCreateResult } from "./results/auth";
import { HashAlgorithm, Role } from "../core/common";
import { hash1 } from "../core/hash";

const Config = getConfig();

@JsonController("/auth")
export default class AuthController {
    @Post("/create")
    async create(@Session() session: SessionData,
        @BodyParam("email") email: string,
        @BodyParam("userName") userName: string,
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
            $or: [{ name: userName }, { email: email }]
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
            hash = hash1(salt, email, userName, password);
        }

        // If no hash was calculated, there is a configuration error
        if (!hash) {
            throw new InternalServerError("Unable to compute password hash, configuration error!");
        }

        // Create user and store in database
        user = await Users.create(<User>{
            name: userName,
            email: email,
            passwordHashAlg: hashAlg,
            passwordHash: hash,
            passwordSalt: salt,
            role: Role.User
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

    @Get("/checkUsername")
    async checkUsername(@Session() session: SessionData,
        @BodyParam("userName") userName: string) {
        // Check if session data already exists
        if (session.authorized) {
            return new Result(ResultCode.AlreadyAuthenticated);
        }

        // Check if an account already exists with the specified username
        var user = await Users.findOne({ name: userName });
        if (user) {
            return new Result(ResultCode.UserAlreadyExists);
        }
    }

    @Get("/checkEmail")
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
    }

    @Get("/login")
    async login(@Session() session: SessionData,
        @BodyParam("email") email: string,
        @BodyParam("passwordHash") passwordHash: number) {
        // Check if session data exists (return previous session)
        if (session.authorized) {
            return new Result(ResultCode.AlreadyAuthenticated, <AuthCreateResult>{
                name: session.user.name,
                email: session.user.email,
                role: session.user.role
            });
        }

        // Authenticate
        var user = await Users.findOne({
            email: email,
            passwordHash: passwordHash
        });

        if (user) {
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

    @Authorized()
    @Delete("/logout")
    delete(@Session() session: SessionData) {
        session.authorized = false;
        session.user = null;
        session.loginAttempts = 0;

        return new Result(ResultCode.Ok);
    }
}
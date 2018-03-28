import * as uuid from "uuid";
import { Result, ResultError, ResultCode } from "../core/result";
import { JsonController, Get, Post, Delete, Authorized, BodyParam, Session } from "routing-controllers";
import { Users, User } from "../models/user";
import { SessionData } from "../models/session";
import { RoleType } from "../core/common";

@JsonController("/user")
export default class UserController {
	@Post("/find")
	async getUser(@BodyParam("name") name: string) {
		// TODO: Return user
	}

	@Authorized()
	@Post("/follow")
	async followUser(@Session() session: SessionData,
		@BodyParam("id") id: string,
		@BodyParam("following") following: boolean) {
		// TODO: Follow or unfollow
	}

	@Authorized()
	@Post("/name")
	async setName(@Session() session: SessionData,
		@BodyParam("name") name: string) {
		// TODO: Check if user exists, otherwise change name
	}
}
import { PassThrough } from "stream";
import { Result, ResultError, ResultCode } from "../core/result";
import { JsonController, Get as GetReq, Post as PostReq, Delete as DeleteReq, Authorized, 
	Param, BodyParam, UploadedFile, Session, NotFoundError, InternalServerError } from "routing-controllers";
import { Storage } from "../database/storage";
import { SessionData } from "../models/session";
import { User, Users } from "../models/user";
import { Post, Posts } from "../models/post";
import { RoleType } from "../core/common";
import { NameManager } from "../core/name-manager";
import { PostCreateResult } from "./results/post";

// Get Image model
const Images = Storage.getModel("image");

@JsonController("/post")
export default class PostController {
	@Authorized()
	@PostReq("/create")
	async createPost(@Session() session: SessionData,
		@BodyParam("topics") topics: string[],
		@BodyParam("caption") caption: string,
		@UploadedFile("file") file: Express.Multer.File) {
		// Get user
		var user = await Users.findById(session.user.id);
		if (!user) {
			throw new InternalServerError("Unable to get user details");
		}

		// Convert buffer to stream
        var stream = new PassThrough();
		stream.end(file.buffer);

        // Write to database
        var imageResult = await Images.write({
            filename: file.originalname,
            contentType: file.mimetype
		}, stream);

		// Generate name for user
		var name = await NameManager.getName();
		
		// Write post to database
		var post = await Posts.create({ /* TODO/NOTE: Casting to Post breaks this? */
			topics: topics,
			name: name,
			caption: caption,
			image: imageResult.handle,
			user: user
		});

		return new Result(ResultCode.Ok, <PostCreateResult>{
			id: post.id,
			name: name,
			topics: topics,
			caption: caption
		});
	}
	
	@Authorized()
	@PostReq("/update")
	async updatePost(@Session() session: SessionData,
		@BodyParam("id") id: string,
		@BodyParam("caption") caption: string) {
		// Check if the user is an admin or moderator as they can update any post, or if the requesting user is
		// the owner of the post

		// TODO: ...
	}
	
	@Authorized()
	@PostReq("/delete")
	async deletePost(@Session() session: SessionData,
		@BodyParam("id") id: string) {
		// Check if the user is an admin or moderator as they can delete any post, or if the requesting user is
		// the owner of the post

		// TODO: ...
	}

	@Authorized()
	@PostReq("/like")
	async likePost(@Session() session: SessionData,
		@BodyParam("id") id: string,
		@BodyParam("liked") liked: boolean) {
		// TODO: Implement
	}

	@PostReq("/find")
	async getPosts(@BodyParam("from") from: Date,
		@BodyParam("count") count: number) {
		// Get posts by followed users
	}

	@PostReq("/find/mostLiked")
	async getMostLikedPosts(@BodyParam("from") from: Date,
		@BodyParam("count") count: number) {
		// TODO: Set date range in config and only get most liked posts from a few days ago!

	}

	@PostReq("/find/user")
	async getUserPosts(@BodyParam("id") id: string,
		@BodyParam("from") from: Date,
		@BodyParam("count") count: number) {
		
	}
	
	@PostReq("/find/all")
	async getAllPosts(@BodyParam("from") from: Date,
		@BodyParam("count") count: number) {

	}

	// TODO: CommentController, ImageController
}
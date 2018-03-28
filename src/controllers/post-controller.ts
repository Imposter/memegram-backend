import { PassThrough } from "stream";
import { Result, ResultError, ResultCode } from "../core/result";
import { JsonController, Get, Post, Delete, Authorized, Param, BodyParam, UploadedFile, Session, NotFoundError } from "routing-controllers";
import { Storage } from "../database/storage";
import { SessionData } from "../models/session";
import { Post as PostData, Posts } from "../models/post";
import { RoleType } from "../core/common";
import { NameManager } from "../core/name-manager";
import { PostCreateResult } from "./results/post";

// Get Image model
const Images = Storage.getModel("image");

@JsonController("/post")
export default class PostController {
	@Authorized()
	@Post("/create")
	async createPost(@BodyParam("topics") topics: string[],
		@BodyParam("caption") caption: string,
		@UploadedFile("file") file: Express.Multer.File) {
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
		var post = await Posts.create(<PostData>{
			topics: topics,
			name: name,
			caption: caption,
			likes: 0,
			image: imageResult.handle
		});

		return new Result(ResultCode.Ok, <PostCreateResult>{
			id: post.id,
			name: name,
			topics: topics,
			caption: caption
		})
	}
	
	@Authorized()
	@Post("/update")
	async updatePost(@Session() session: SessionData,
		@BodyParam("id") id: string,
		@BodyParam("caption") caption: string) {
		// Check if the user is an admin or moderator as they can update any post, or if the requesting user is
		// the owner of the post

		// TODO: ...
	}
	
	@Authorized()
	@Post("/delete")
	async deletePost(@Session() session: SessionData,
		@BodyParam("id") id: string) {
		// Check if the user is an admin or moderator as they can delete any post, or if the requesting user is
		// the owner of the post

		// TODO: ...
	}

	@Authorized()
	@Post("/like")
	async likePost(@Session() session: SessionData,
		@BodyParam("id") id: string,
		@BodyParam("liked") liked: boolean) {
		// TODO: Implement
	}

	@Post("/find")
	async getPosts(@BodyParam("from") from: Date,
		@BodyParam("count") count: number) {
		// Get posts by followed users
	}

	@Post("/find/mostLiked")
	async getMostLikedPosts(@BodyParam("from") from: Date,
		@BodyParam("count") count: number) {
		// TODO: Set date range in config and only get most liked posts from a few days ago!

	}

	@Post("/find/user")
	async getUserPosts(@BodyParam("id") id: string,
		@BodyParam("from") from: Date,
		@BodyParam("count") count: number) {
		
	}
	
	@Post("/find/all")
	async getAllPosts(@BodyParam("from") from: Date,
		@BodyParam("count") count: number) {

	}

	// TODO: CommentController, ImageController
}
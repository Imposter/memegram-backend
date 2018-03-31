import { PassThrough } from "stream";
import { Result, ResultError, ResultCode } from "../core/result";
import { JsonController, Get as GetReq, Post as PostReq, Delete as DeleteReq, 
	Param, BodyParam, UploadedFile, Session, NotFoundError, InternalServerError } from "routing-controllers";
import { Storage } from "../database/storage";
import { Post, Posts } from "../models/post";
import { NameManager } from "../core/name-manager";
import { PostCreateResult } from "./results/post";

// Get Image model
const Images = Storage.getModel("image");

@JsonController("/post")
export default class PostController {
	@PostReq("/create")
	async createPost(@BodyParam("name", { required: false }) name: string,
		@BodyParam("topics") topics: string[],
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

		// Generate name for user, if one wasn't provided
		name = name || await NameManager.getName();
		
		// Write post to database
		var post = await Posts.create(<Post>{
			topics: topics,
			name: name,
			caption: caption,
			image: imageResult.handle
		});

		return new Result(ResultCode.Ok, <PostCreateResult>{
			id: post.id,
			name: name,
			topics: topics,
			caption: caption
		});
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
	
	@PostReq("/find/all")
	async getAllPosts(@BodyParam("from") from: Date,
		@BodyParam("count") count: number) {

	}
}
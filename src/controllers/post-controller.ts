import { getConfig } from "../config";
import { PassThrough } from "stream";
import { Result, ResultError, ResultCode } from "../core/result";
import { JsonController, Get as GetReq, Post as PostReq, Delete as DeleteReq, 
	Param, BodyParam, UploadedFile, Session, NotFoundError, InternalServerError } from "routing-controllers";
import { Storage } from "../database/storage";
import { Post, Posts } from "../models/post";
import { NameManager } from "../core/name-manager";

// Get config
const Config = getConfig();

// Get Image model
const Images = Storage.getModel("image");

@JsonController("/post")
export default class PostController {
	@PostReq("/create")
	async createPost(@BodyParam("name", { required: false }) name: string,
		@BodyParam("topics", { required: false }) topics: string[],
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

		return new Result(ResultCode.Ok, post);
	}

	@PostReq("/find")
	async getPosts(@BodyParam("topics", { required: false }) topics: string[],
		@BodyParam("keywords", { required: false }) keywords: string,
		@BodyParam("from", { required: false }) from: Date,
		@BodyParam("count", { required: false }) count: number) {
		// Convert topics to regex
        var regexTopics = [];
        if (topics != null) {
			for (var topic of topics) {
				regexTopics.push(new RegExp(topic, "i"));
			}
        }

        // Get all posts for topics
		var query: any = {};

		// Set key words
		if (keywords != null) {
			query.caption = new RegExp(`^${keywords}$`, "i");
		}

		// Set topics
		if (regexTopics.length > 0) {
			query.topics = { $all: topics };
		}

		if (from) {
			query.createdAt = { $lte: from };
		}

		// Get posts
		var posts;
		if (count) {
			posts = await Posts.find(query).limit(count).sort("-createdAt");
		} else {
			posts = await Posts.find(query).sort("-createdAt");
		}

        return new Result(ResultCode.Ok, posts, true);
	}

	@PostReq("/find/mostPopular")
	async getMostLikedPosts(@BodyParam("from", { required: false }) from: Date,
		@BodyParam("count", { required: false }) count: number) {
        // Get all posts for topics
		var query: any = {
			createdAt: { 
				$gte: new Date(
					(new Date().getTime() // Get time since epoch (in milliseconds)
						- Config.app.mostPopularTime * 1000)) // Remove popular time (in milliseconds)
			}
		};

		if (from) {
			query.createdAt = { $lte: from };
		}

		// Get posts
		var posts;
		if (count) {
			posts = await Posts.find(query).limit(count).sort("-createdAt");
		} else {
			posts = await Posts.find(query).sort("-createdAt");
		}

        return new Result(ResultCode.Ok, posts, true);
	}
}
import * as sharp from "sharp";
import { getConfig } from "../config";
import { PassThrough } from "stream";
import { Result, ResultError, ResultCode } from "../core/result";
import { JsonController, Get as GetReq, Post as PostReq, Delete as DeleteReq, Param, BodyParam, UploadedFile, Session, NotFoundError, InternalServerError } from "routing-controllers";
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
		@UploadedFile("file", { options: { limits: { fileSize: Config.app.postImageSizeLimit } } }) file: Express.Multer.File) {
		// Check caption size limit
		if (caption.length > Config.app.postCharacterLimit) {
			throw new ResultError(ResultCode.InvalidCaptionTooLong, "Caption too long");
		}

		// Resize image buffer to not be greater than the limit set
		var buffer = await sharp(file.buffer)
			.resize(Config.app.postImageWidthLimit, Config.app.postImageHeightLimit)
			.withoutEnlargement()
			.max()
			.toBuffer();

		// Convert buffer to stream
		var stream = new PassThrough();
		stream.end(buffer);

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
			posts = await Posts.find(query).limit(count).sort("-createdAt"); // New to old
		} else {
			posts = await Posts.find(query).sort("-createdAt"); // New to old
		}

		return new Result(ResultCode.Ok, posts, true);
	}

	@GetReq("/image/:postId") 
	async getImage(@Param("postId") postId: string) {
		// Get post
		var post = await Posts.findById(postId);
		if (!post) {
			throw new NotFoundError("Post not found!");
		}

		// Get image
		var result = await Images.findById(post.image as string);

		return result.read();
	}

	@GetReq("/name")
	async getRandomName() {
		// Generate random name
		var name = await NameManager.getName();
		return new Result(ResultCode.Ok, name);
	}

	@GetReq("/settings")
	async getSettings() {
		return new Result(ResultCode.Ok, {
			postCharacterLimit: Config.app.postCharacterLimit,
			postImageSizeLimit: Config.app.postImageSizeLimit
		});
	}
}
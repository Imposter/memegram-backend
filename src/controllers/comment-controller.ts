import { getConfig } from "../config";
import { PassThrough } from "stream";
import { Result, ResultError, ResultCode } from "../core/result";
import { JsonController, Get as GetReq, Post as PostReq, Delete as DeleteReq, Param, BodyParam, UploadedFile, Session, NotFoundError, InternalServerError } from "routing-controllers";
import { Storage } from "../database/storage";
import { Post, Posts } from "../models/post";
import { Comment, Comments } from "../models/comment";
import { NameManager } from "../core/name-manager";

// Get config
const Config = getConfig();

@JsonController("/comment")
export default class CommentController {
	@PostReq("/create")
	async createComment(@BodyParam("postId") postId: string,
		@BodyParam("name", { required: false }) name: string,
		@BodyParam("comment") comment: string) {
		// Check if post exists
		var post = await Posts.findById(postId);
		if (!post) {
			throw new ResultError(ResultCode.InvalidPostId, "Post not found");
		}

		// Check comment size limit
		if (comment.length > Config.app.commentCharacterLimit) {
			throw new ResultError(ResultCode.InvalidCommentTooLong, "Comment too long");
		}

		// Get all comments for post
		var comments = await Comments.find({});

		// Get all used names
		var names = [];
		for (var c of comments) {
			names.push(c.name);
		}

		// Generate name for user, if one wasn't provided
		name = name || await NameManager.getName(names);

		// Post comment
		var result = await Comments.create({
			post: post,
			name: name,
			comment: comment
		});

		return new Result(ResultCode.Ok, result);
	}

	@PostReq("/find")
	async getCommentsForPost(@BodyParam("postId") postId: string,
		@BodyParam("from", { required: false }) from: Date,
		@BodyParam("count", { required: false }) count: number) {
		// Check if post exists
		var post = await Posts.findById(postId);
		if (!post) {
			throw new ResultError(ResultCode.InvalidPostId, "Post not found");
		}

		// Build query
		var query: any = { post: post };
		if (from) {
			query.createdAt = { $gte: from };
		}

		// Get comments
		var comments;
		if (count) {
			comments = await Comments.find(query).limit(count).sort("createdAt"); // Old to new
		} else {
			comments = await Comments.find(query).sort("createdAt"); // Old to new
		}

		return new Result(ResultCode.Ok, comments, true);
	}

	@PostReq("/name")
	async getRandomName(@BodyParam("postId") postId: string) {
		// Check if post exists
		var post = await Posts.findById(postId);
		if (!post) {
			throw new ResultError(ResultCode.InvalidPostId, "Post not found");
		}

		// Get all comments for post
		var comments = await Comments.find({});

		// Get all used names
		var names = [];
		for (var c of comments) {
			names.push(c.name);
		}

		// Generate name for user
		var name = await NameManager.getName(names);

		return new Result(ResultCode.Ok, name);
	}

	@GetReq("/settings")
	async getSettings() {
		return new Result(ResultCode.Ok, {
			commentCharacterLimit: Config.app.commentCharacterLimit
		});
	}
}
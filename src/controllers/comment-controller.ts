import { getConfig } from "../config";
import { PassThrough } from "stream";
import { Result, ResultError, ResultCode } from "../core/result";
import { JsonController, Get as GetReq, Post as PostReq, Delete as DeleteReq, 
	Param, BodyParam, UploadedFile, Session, NotFoundError, InternalServerError } from "routing-controllers";
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
		@BodyParam("caption") caption: string) {
		// Check if post exists
		var post = await Posts.findById(postId);
		if (!post) {
			throw new ResultError(ResultCode.InvalidPostId, "Post not found");
		}
		
		// Generate name for user, if one wasn't provided
		name = name || await NameManager.getName();
		
		// Post comment
		var comment = await Comments.create({
			post: post,
			name: name,
			comment: caption
		});

		return new Result(ResultCode.Ok, comment);
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
			query.createdAt = { $lte: from };
		}

		// Get comments
		var comments;
		if (count) {
			comments = await Comments.find(query).limit(count).sort("-createdAt");
		} else {
			comments = await Comments.find(query).sort("-createdAt");
		}

		return new Result(ResultCode.Ok, comments, true);
	}
}
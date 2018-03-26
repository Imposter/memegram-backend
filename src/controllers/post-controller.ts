import { PassThrough } from "stream";
import { Result, ResultError, ResultCode } from "../core/result";
import { JsonController, Get, Post, Delete, Authorized, Param, BodyParam, UploadedFile, NotFoundError } from "routing-controllers";
import { Storage } from "../database/storage";
import { Posts } from "../models/post";

// Get Image model
const Images = Storage.getModel("image");

// TODO: Implement
@JsonController("/post")
export default class PostController {
	// NOTE: This works
	// TODO: Design on paper
	@Post("/test")
	async test(@BodyParam("caption") caption: string,
		@UploadedFile("file") file: Express.Multer.File) {
		console.log(caption);
		console.log(file);
		return "";
	}

    @Post("/")
    async createPost(@BodyParam("caption") caption: string) {

    }

    // TODO: Edit post comment, do not allow modifications of images

    @Get("/image/:postId")
    async downloadImage(@Param("postId") postId: string) {
		/*
		// Get image
        var result = await Images.findById(id);

        if (result) {
			// TODO: Set content-type!
            return await result.read();
        } else {
            throw new NotFoundError(`File ${id} could not be located`);
		}
		*/
    }

    @Authorized()
    @Post("/image/:postId")
    async uploadImage(@Param("postId") postId: string,
        @UploadedFile("file") file: Express.Multer.File) {
		/*
        // Convert buffer to stream
        var stream = new PassThrough();
        stream.end(file.buffer);

        // Write to database
        var result = await Images.write({
            filename: file.originalname,
            contentType: file.mimetype
        }, stream);

        // TODO: Make result models
        return new Result(ResultCode.Ok, {
            id: result.id.toHexString(),
            fileName: result.filename
		});
		*/
    }

    // TODO: Authorized and owner or role
    @Delete("/image")
    async deleteImage(@BodyParam("id") id: string) {
		/*
        // Delete image by id
        var result = await Images.unlinkById(id);

        if (result) {
            // TODO: Make result models
        } else {
            throw new NotFoundError(`File ${id} could not be located`);
		}
		*/
    }
}
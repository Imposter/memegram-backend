import * as os from "os";
import { PassThrough } from "stream";
import { Result, ResultError, ResultCode } from "../core/result";
import { JsonController, Get, Post, Delete, Authorized, Param, BodyParam, UploadedFile, NotFoundError } from "routing-controllers";
import { Storage } from "../database/storage";

// Get Image model
const Images = Storage.getModel("image");

@JsonController("/image")
export default class ImageController {
    @Get("/:id")
    async getImage(@Param("id") id: string) {
        // Get image
        var result = await Images.findById(id);

        if (result) {
            return await result.read();
        } else {
            throw new NotFoundError(`File ${id} could not be located`);
        }
    }

    @Authorized()
    @Post("/")
    async postImage(@UploadedFile("file") file: Express.Multer.File) {
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
    }

    @Delete("/")
    async deleteImage(@BodyParam("id") id: string) {
        // Delete image by id
        var result = await Images.unlinkById(id);

        if (result) {
            // TODO: Make result models
        } else {
            throw new NotFoundError(`File ${id} could not be located`);
        }
    }
}
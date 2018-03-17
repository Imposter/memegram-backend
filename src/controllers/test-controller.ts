import * as os from "os";
import { PassThrough } from "stream";
import { Result, ResultError, ResultCode } from "../core/result";
import { JsonController, Get, Post, Authorized, UploadedFile, BodyParam, Param, Req, Res, NotFoundError } from "routing-controllers";
import { Storage } from "../database/storage";

// Get Image model
const Images = Storage.getModel("image");

@JsonController("/test")
export default class TestController {
    @Get("/image/:fileName")
    async getImage(@Param("fileName") fileName: string) {
        // Get image
        var result = await Images.findOne({
            filename: fileName
        });

        if (result) {
            return await result.read();
        } else {
            throw new NotFoundError(`${fileName} could not be located`);
        }
    }

    @Post("/image")
    async postImage(@UploadedFile("file") file: Express.Multer.File) {
        // Convert buffer to stream
        var stream = new PassThrough();
        stream.end(file.buffer);

        // Write to database
        var result = await Images.write({
            filename: file.originalname,
            contentType: file.mimetype
        }, stream);

        return new Result(ResultCode.Ok, {
            id: result.id.toHexString(),
            fileName: result.filename
        });
    }
}
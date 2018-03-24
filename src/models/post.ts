import { getConfig } from "../config";
import { Schema } from "../database/schema";
import { gridfs } from "../database/storage";
import { prop, Ref, Typegoose, ModelType, InstanceType } from "typegoose";
import { Role, HashAlgorithm } from "../core/common";

const Config = getConfig();

export class Post extends Schema {
	@prop({ required: true, maxlength: Config.app.postCharacterLimit })
	caption: string;

	@prop({ required: true })
	likes: number;

	@prop({ required: true, ref: "Images" })
	image: Ref<gridfs.File>;
}

export const Posts = Schema.getModel(Post);
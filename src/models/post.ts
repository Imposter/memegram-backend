import { getConfig } from "../config";
import { Schema } from "../database/schema";
import { gridfs } from "../database/storage";
import { prop, arrayProp, Ref, Typegoose, ModelType, InstanceType } from "typegoose";
import { Comment } from "./comment";

const Config = getConfig();

export class Post extends Schema {
	@prop({ required: true })
	topics: string[];

	@prop({ required: true })
	name: string; // poster

	@prop({ required: true, maxlength: Config.app.postCharacterLimit })
	caption: string;

	@prop({ required: true, ref: "Images" })
	image: Ref<gridfs.File>;

	@arrayProp({ itemsRef: Comment, default: [] })
	comments?: Ref<Comment>[];
}

export const Posts = Schema.getModel(Post);
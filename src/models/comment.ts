import { getConfig } from "../config";
import { Schema } from "../database/schema";
import { gridfs } from "../database/storage";
import { prop, arrayProp, Ref, Typegoose, ModelType, InstanceType } from "typegoose";
import { Post } from "./post";
import { User } from "./user";

export class Comment extends Schema {
    @prop({ required: true, ref: Post })
    post: Ref<Post>;

	@prop({ required: true, ref: User })
	user: Ref<User>; // commenter

    @prop({ required: true })
    name: string; // commenter
    
    @prop({ required: true })
    comment: string;
    
    @arrayProp({ itemsRef: User, default: [] })
    likes: Ref<User>[];
}
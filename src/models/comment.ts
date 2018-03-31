import { getConfig } from "../config";
import { Schema } from "../database/schema";
import { gridfs } from "../database/storage";
import { prop, arrayProp, Ref, Typegoose, ModelType, InstanceType } from "typegoose";
import { Post } from "./post";

export class Comment extends Schema {
    @prop({ required: true, ref: Post })
    post: Ref<Post>;

    @prop({ required: true })
    name: string; // commenter
    
    @prop({ required: true })
    comment: string;
}
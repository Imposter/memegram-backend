import { Schema } from "../database/schema";
import { prop, Ref, Typegoose, ModelType, InstanceType } from "typegoose";
import { Role, HashAlgorithm } from "./common";

export class User extends Schema {
    @prop({ required: true })
    name: string;

    @prop({ required: true })
    email: string;

    @prop({ required: true })
    passwordSalt: string;

    @prop({ required: true })
    passwordHash: string;

    @prop({ enum: HashAlgorithm, required: true })
    passwordHashAlg: HashAlgorithm;

    @prop({ enum: Role, required: true })
    role: Role;
}

export const Users = Schema.getModel(User);
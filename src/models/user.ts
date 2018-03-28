import { Schema } from "../database/schema";
import { prop, Ref, Typegoose, ModelType, InstanceType } from "typegoose";
import { RoleType, HashAlgorithm } from "../core/common";

export class User extends Schema {
    @prop({ required: true })
    name: string; // TODO: Remove

    @prop({ required: true })
    email: string;

    @prop({ required: true })
    passwordSalt: string;

    @prop({ required: true })
    passwordHash: string;

    @prop({ enum: HashAlgorithm, required: true })
    passwordHashAlg: HashAlgorithm;

    @prop({ enum: RoleType, required: true })
    role: RoleType;
}

export const Users = Schema.getModel(User);
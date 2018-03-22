import { getConfig } from "../config";
import { Schema } from "../database/schema";
import { prop, Ref, Typegoose, ModelType, InstanceType } from "typegoose";
import { Role } from "./common";
import { User } from "./user";

export interface SessionData extends Express.SessionData {
    authorized?: boolean;
    loginAttempts?: number;
    user?: User;
}

export class Session extends Schema {
    @prop({ required: true })
    sid: string;

    @prop({ required: true,  })
    data: SessionData;
    
    // Read timeout from config when creating schema to prevent sessions from existing forever
    @prop({ required: true, expires: `${getConfig().session.timeout}ms` })
    expires: Date;
}

export const Sessions = Schema.getModel(Session);
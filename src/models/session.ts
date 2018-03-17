import { getConfig } from "../config";
import { Schema } from "../database/schema";
import { prop, Ref, Typegoose, ModelType, InstanceType } from "typegoose";
import { Role } from "./common";

export interface SessionInfo {
    authorized: boolean;
    id: string;
    name: string;
    email: string;
    role: Role;
}

export interface SessionData extends Express.SessionData {
    info?: SessionInfo;
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
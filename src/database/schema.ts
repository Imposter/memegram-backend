// Imports
import * as mongoose from "mongoose";

// Use global promises instead of mpromise
(mongoose as any).Promise = global.Promise;

// Import typegoose and gridfs
import { prop, pre, ModelType, Typegoose, InstanceType } from "typegoose";

@pre<Schema>("save", function (next) {
    this.updatedAt = new Date();
    if (this.createdAt == null) {
        this.createdAt = this.updatedAt;
    }
    next();
})
export class Schema extends Typegoose {
    @prop({ required: false })
    createdAt?: Date;

    @prop({ required: false })
    updatedAt?: Date;

    public get id(): mongoose.Types.ObjectId {
        return (this as any)._id;
    }

    public static getModel<TSchema extends Schema>(schemaType: new () => TSchema): mongoose.Model<InstanceType<TSchema>> {
        return new schemaType().getModelForClass(schemaType, {
            existingMongoose: mongoose
        });
    }
}
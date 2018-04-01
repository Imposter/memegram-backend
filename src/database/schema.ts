// Imports
import * as mongoose from "mongoose";

// Use global promises instead of mpromise
(mongoose as any).Promise = global.Promise;

// Import typegoose and gridfs
import { prop, pre, plugin, ModelType, Typegoose, InstanceType } from "typegoose";

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
            existingMongoose: mongoose,
            schemaOptions: {
                toJSON: {
                    transform: function (doc, ret, options) {
                        // Remove _id and replace with id
                        ret.id = ret._id.toString();
                        delete ret._id;
                        delete ret.__v;

                        // For any other properties of type ObjectID, replace with a string value
                        var paths = doc.schema.paths;
                        for (var path in paths) {
                            // Skip _id as it has already been dealt with
                            if (path == "_id")
                                continue;

                            var pathType = paths[path].instance;
                            if (pathType == "ObjectID") {
                                ret[path] = ret[path].toString();
                            }
                        }
                    }
                }
            }
        });
    }
}
import * as mongoose from "mongoose";
import { Readable, Stream } from "stream";
const gridfs: (options: gridfs.Options) => gridfs.GridFS = require("mongoose-gridfs");

// Typings for mongoose-gridfs
declare namespace gridfs {    
    interface FileDetails {
        filename?: string;
        contentType?: string;
    }
    
    interface Options {
        collection?: string;
        model?: string;
        mongooseConnection: mongoose.Connection;
    }
    
    interface Model {
        write(fileDetails: FileDetails, stream: Readable, done: (error: Error, createdFile: File) => void): void;
        findById(objectId: mongoose.Types.ObjectId, done?: (error: Error, file: File) => void): void;
        findOne(conditions: any, callback?: (err: any, file: File) => void);
        readById(objectId: mongoose.Types.ObjectId, done?: (error: Error, fileContent: any) => void): Stream;
        readByFileName(fileName: string, done?: (error: Error, fileContent) => void): Stream;
        unlinkById(objectId: mongoose.Types.ObjectId, done: (error: Error, unlinkedFile: File) => void): void;
    }

    interface File extends mongoose.Document {
        length: number;
        chunkSize: number;
        uploadDate: Date;
        md5: string;
        filename: string;
        contentType: string;
        aliases: string[];
        metadata: object;

        write(stream: Readable, done: (error: Error, createdFile: File) => void): void;
        read(done?: (error: Error, fileContent: any) => void): Stream;
        unlink(done: (error: Error, unlinkedFile: File) => void): void;
    }

    // TODO/NOTE: Schema, and whatnot
    interface GridFS {
        model: Model;
    }
}

export class File {
    private instance: gridfs.File;

    constructor(instance: gridfs.File) {
        this.instance = instance;
    }

    get checksum(): string {
        return this.instance.md5;
    }

    get filename(): string {
        return this.instance.filename;
    }

    get contentType(): string {
        return this.instance.contentType;
    }

    get uploadDate(): Date {
        return this.instance.uploadDate;
    }

    get length(): number {
        return this.instance.length;
    }

    get id(): mongoose.Types.ObjectId {
        return this.instance._id;
    }

    public write(stream: Readable): Promise<File> {
        return new Promise((resolve, reject) => {
            this.instance.write(stream, (error, createdFile) => {
                if (error) reject(error);
                else resolve(this);
            })
        });
    }

    public read(): Promise<Stream> {
        return new Promise((resolve, reject) => {
            var stream = this.instance.read();
            if (!stream) reject(new Error("Unable to read"));
            else resolve(stream);
        });
    }

    public unlink(): Promise<File> {
        return new Promise((resolve, reject) => {
            this.instance.unlink((error, unlinkedFIle) => {
                if (error) reject(error);
                else resolve(this);
            })
        });
    }
}

export class Model {
    private instance: gridfs.Model;

    constructor(instance: gridfs.Model) {
        this.instance = instance;
    }

    public write(fileDetails: gridfs.FileDetails, stream: Readable): Promise<File> {
        return new Promise((resolve, reject) => {
            this.instance.write(fileDetails, stream, (error, createdFile) => {
                if (error) reject(error);
                else resolve(new File(createdFile));
            });
        });
    }

    public findById(objectId: mongoose.Types.ObjectId): Promise<File> {
        return new Promise((resolve, reject) => {
            this.instance.findById(objectId, (error, file) => {
                if (error) reject(error);
                else if (!file) resolve(null);
                else resolve(new File(file));
            });
        });
    }

    public findOne(conditions: any): Promise<File> {
        return new Promise((resolve, reject) => {
            this.instance.findOne(conditions, (error, file) => {
                if (error) reject(error);
                else if (!file) resolve(null);
                else resolve(new File(file));
            });
        });
    }

    public readById(objectId: mongoose.Types.ObjectId): Promise<Stream> {
        return new Promise((resolve, reject) => {
            var stream = this.instance.readById(objectId);
            if (!stream) reject(new Error("Unable to read"));
            else resolve(stream);
        });
    }

    public readByFileName(fileName: string): Promise<Stream> {
        return new Promise((resolve, reject) => {
            var stream = this.instance.readByFileName(fileName);
            if (!stream) reject(new Error("Unable to read"));
            else resolve(stream);
        });
    }

    public unlinkById(objectId: mongoose.Types.ObjectId): Promise<File> {
        return new Promise((resolve, reject) => {
            this.instance.unlinkById(objectId, (error, unlinkedFile) => {
                if (error) reject(error);
                else resolve(new File(unlinkedFile));
            });
        });
    }
}

export class Storage {
    public static getModel(model: string): Model {
        return new Model(gridfs({
            collection: model.toLowerCase() + "s",
            model: model,
            mongooseConnection: mongoose.connection
        }).model);
    }
}
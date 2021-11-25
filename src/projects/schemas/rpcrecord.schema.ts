import * as mongoose from 'mongoose';

export const RpcrecordSchema = new mongoose.Schema({
    apikey: String,
    method: String,
    timestamp: Number,
},
    {collection: 'projectrpcrecords', versionKey: false},
);

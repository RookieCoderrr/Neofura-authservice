import * as mongoose from 'mongoose';
import mongooseLong from 'mongoose-long';

export const RpcrecordSchema = new mongoose.Schema({
    apikey: String,
    method: String,
    net : String,
    timestamp: Number,
},
    {collection: 'projectrpcrecords', versionKey: false},
);

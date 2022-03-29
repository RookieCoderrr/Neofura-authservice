import * as mongoose from 'mongoose';

export const ProjectSchema = new mongoose.Schema({
    name: String,
    date: { type: Date, default: Date.now },
    email: String,
    apikey: String,
    apisecret: String,
    introduction: String,
    secretrequired: {type: Boolean, default: false},
    limitperday: {type: Number, default: 5000},
    limitpersecond: {type: Number, default: 10},
    request: {type: Number, default: 0},
    origin: {type: Array, default: []},
    contractAddress: {type: Array, default: []},
    apiRequest: {type: Array, default: []},
},
    {collection: 'projects', versionKey: false},
    );

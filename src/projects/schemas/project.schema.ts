import * as mongoose from 'mongoose';

export const ProjectSchema = new mongoose.Schema({
    name: String,
    date: { type: Date, default: Date.now },
    email: String,
    apikey: String,
    apisecret: String,
    introduction: String,
    secretrequired: {type: Boolean, default: false},
    limitperday: {type: Number, default: 10000},
    origin: {type: Array, default: []},
});

import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  id: String,
  date: { type: Date, default: Date.now },
  email: String,
  nickname: String,
  role: String,
  level: String,
  status: String,
  auth: Boolean,
  password: String,
},
    {collection: 'users', versionKey: false},
    );

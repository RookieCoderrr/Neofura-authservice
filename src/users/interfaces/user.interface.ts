import { Document } from 'mongoose';

export interface User extends Document {
  status: string;
  email: string;
  nickname: string;
  password: string;
  role: string;
  auth: boolean;
  level: number;
}

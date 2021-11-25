import { Document } from 'mongoose';

export interface Rpcrecord extends Document {
    apikey: string;
    method: string;
    timestamp: number;
}

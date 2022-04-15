import { Document } from 'mongoose';
import mongoose from 'mongoose';

export interface Rpcrecord extends Document {
    apikey: string;
    method: string;
    timestamp: number;
    net: string;
}

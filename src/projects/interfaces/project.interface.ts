import { Document } from 'mongoose';

export interface Project extends Document {
    name: string;
    introduction: string;
    email: string;
    apikey: string;
    apisecret: string;
    limitperday: number;
    limitpersecond: number;
    secretrequired: boolean;
    origin: Array<string>;
    request: number;
    contractAddress: Array<string>;
    apiRequest: Array<string>;
}

import {IsString, MaxLength, IsEmail, IsOptional, Max, IsNumber} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetLimitperdayDto {

    @IsString()
    @ApiProperty()
    readonly apikey: string;

    @ApiProperty()
    @IsNumber()
    @Max(1000000)
    readonly limitperday: number;
}

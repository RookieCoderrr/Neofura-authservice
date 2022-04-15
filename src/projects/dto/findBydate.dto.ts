import {IsString, MaxLength, IsEmail, IsOptional, IsNumber} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindBydateDto {
    @IsEmail()
    @ApiProperty()
    readonly email: string;

    @IsString()
    @ApiProperty()
    readonly apikey: string;

    @IsString()
    @ApiProperty()
    readonly net: string;

    @IsNumber()
    @ApiProperty()
    readonly start: number;

    @IsNumber()
    @ApiProperty()
    readonly end: number;
}

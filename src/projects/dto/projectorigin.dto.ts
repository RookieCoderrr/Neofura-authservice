import {IsString, MaxLength, IsEmail, IsOptional, Max, IsNumber} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectoriginDto {
    @IsEmail()
    @ApiProperty()
    readonly email: string;

    @IsString()
    @ApiProperty()
    readonly apikey: string;

    @ApiProperty()
    @IsString()
    readonly origin: string;
}

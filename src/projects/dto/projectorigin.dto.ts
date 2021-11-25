import {IsString, MaxLength, IsEmail, IsOptional, Max, IsNumber} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectoriginDto {

    @IsString()
    @ApiProperty()
    readonly apikey: string;

    @ApiProperty()
    @IsString()
    readonly origin: string;
}

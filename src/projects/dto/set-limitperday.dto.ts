import {IsString, MaxLength, IsEmail, IsOptional, Max, IsNumber, Min} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetLimitperdayDto {
    @IsEmail()
    @ApiProperty()
    readonly email: string;

    @IsString()
    @ApiProperty()
    readonly apikey: string;

    @ApiProperty()
    @IsNumber()
    @Max(5000)
    @Min(0)
    readonly limitPerday: number;
}

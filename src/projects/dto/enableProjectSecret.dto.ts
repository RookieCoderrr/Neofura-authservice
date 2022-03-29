import {IsBoolean, IsEmail, IsNumber, IsString, Max} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class EnableProjectSecretDto {

    @IsEmail()
    @ApiProperty()
    readonly email: string;

    @IsString()
    @ApiProperty()
    readonly apikey: string;

    @ApiProperty()
    @IsBoolean()
    readonly enable: boolean;
}

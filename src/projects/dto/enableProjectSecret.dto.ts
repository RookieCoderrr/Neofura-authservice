import {IsBoolean, IsNumber, IsString, Max} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class EnableProjectSecretDto {

    @IsString()
    @ApiProperty()
    readonly apikey: string;

    @ApiProperty()
    @IsBoolean()
    readonly enable: boolean;
}

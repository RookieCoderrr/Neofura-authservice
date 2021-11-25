import { IsString, MaxLength, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteProjectDt {
    @IsEmail()
    @ApiProperty()
    readonly email: string;

    @IsString()
    @ApiProperty()
    readonly apikey: string;
}

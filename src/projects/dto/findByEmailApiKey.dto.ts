import { IsString, MaxLength, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindByEmailDto {
    @IsEmail()
    @ApiProperty()
    readonly email: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {

    @ApiProperty({ type: String })
    title: string;

    @ApiProperty({ type: String })
    message: string;

    @ApiProperty({ type: Number })
    userId: number;

}

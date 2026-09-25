import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
    @ApiProperty({ type: Number })
    id: number;

    @ApiProperty({ type: String })
    title: string;

    @ApiProperty({ type: String })
    message: string;

    @ApiProperty({ type: Number })
    userId: number;

    @ApiProperty({ type: String })
    internalMessage: string;

    @ApiProperty({ type: String })
    status: string;

    @ApiProperty({ type: Date })
    timestamps: Date;
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateContactDto } from './create-contact.dto.js';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateContactDto extends PartialType(CreateContactDto) {
        @ApiProperty({ type: String })
        title: string;
    
        @ApiProperty({ type: String })
        message: string;
     
        @ApiProperty({ type: String })
        internalMessage: string;
    
        @ApiProperty({ type: String })
        status: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({
    example: 'Laptop',
  })
  title: string;

  @ApiProperty({
    example: 'Dell Latitude laptop',
  })
  description: string;

  @ApiProperty({
    example: 'https://example.com/laptop.jpg',
  })
  imageUrl: string;
}

import { ApiProperty } from "@nestjs/swagger"
export class LoginAuthDto {

  @ApiProperty({
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    example: 'password123'
  })
  password: string;
}


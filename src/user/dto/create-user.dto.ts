import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'alice' })
  username: string;

  @ApiProperty({ example: 'alice@test.com' })
  email: string;

  @ApiProperty({ example: 'MotDePasse123' })
  password: string;
}

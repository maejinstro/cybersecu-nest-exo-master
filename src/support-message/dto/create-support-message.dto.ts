import { ApiProperty } from '@nestjs/swagger';

export class CreateSupportMessageDto {
  @ApiProperty({ example: 'Problème de connexion' })
  subject: string;

  @ApiProperty({ example: "Je n'arrive pas à me connecter à mon compte." })
  message: string;
}

import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';

@Entity()
export class SupportMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.supportMessages, { onDelete: 'CASCADE' })
  user: Relation<User>;
}

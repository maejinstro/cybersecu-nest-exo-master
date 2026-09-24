import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.items, { onDelete: 'CASCADE' })
  user: Relation<User>;
}

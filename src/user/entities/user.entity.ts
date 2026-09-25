import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { Item } from '../../item/entities/item.entity.js';
import { SupportMessage } from '../../support-message/entities/support-message.entity.js';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Item, (item) => item.user)
  items: Relation<Item[]>;

  @OneToMany(() => SupportMessage, (supportMessage) => supportMessage.user)
  supportMessages: Relation<SupportMessage[]>;
}

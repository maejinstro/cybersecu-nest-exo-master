import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { User } from "../../user/entities/user.entity.js";

@Entity()
export class Contact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: 'text' })
    message: string;
    
    @Column({ type: 'text' })
    internalMessage: string;

    @Column({ type: 'text' })
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'number', nullable: true })
    userId: number;

    @ManyToOne(() => User, (user) => user.items, { onDelete: 'CASCADE' })
    user: Relation<User>;

}

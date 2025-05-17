import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('chat')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  chat_uuid: string;

  @Column({ type: 'varchar', length: 50 })
  chat_id: string;

  @Column({ type: 'varchar', length: 100 })
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  role: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}

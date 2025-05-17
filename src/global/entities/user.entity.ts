import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_uuid: string;

  @Column({ type: 'varchar', length: 50 })
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  user_password: string;

  @Column({ type: 'varchar', length: 50 })
  user_name: string;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}

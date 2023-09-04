import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('addresses')
export class AddressEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  road: string;

  @Column({ type: 'varchar', length: 150 })
  district: string;

  @Column()
  houseNumber: number;

  @Column({ type: 'varchar', length: 8 })
  cep: string;

  @Column({ type: 'varchar', length: 150 })
  city: string;

  @Column({ length: 2 })
  state: string;

  @Column({ nullable: true, type: 'text' })
  complement?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  owner: UserEntity;
}

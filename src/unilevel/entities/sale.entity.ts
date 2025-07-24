import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SaleType } from '../enums/sale-type.enum';
import { StatusSale } from '../enums/status-sale.enum';
import { CurrencyType } from '../enums/currency-type.enum';
import { LotTransactionRole } from '../enums/lot-transaction-role.enum';

@Entity('sale')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  clientFullName: string;

  @Column({
    type: 'varchar',
    length: 15,
    nullable: true,
  })
  phone?: string;

  @Column({
    type: 'enum',
    enum: CurrencyType,
    default: CurrencyType.PEN,
  })
  currency: CurrencyType;

  @Column({
    type: 'numeric',
    scale: 2,
    nullable: false,
  })
  amount: number;

  @Column({
    type: 'numeric',
    scale: 2,
    nullable: true,
  })
  amountInitial?: number;

  @Column({
    type: 'numeric',
    scale: 2,
    nullable: true,
  })
  numberCoutes?: number;

  @Column({
    type: 'enum',
    enum: SaleType,
  })
  type: SaleType;

  @Column({
    type: 'enum',
    enum: LotTransactionRole,
    default: LotTransactionRole.BUYER,
  })
  lotTransactionRole: LotTransactionRole;

  @Column({
    type: 'enum',
    enum: StatusSale,
    default: StatusSale.PENDING,
  })
  status: StatusSale;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  saleIdReference: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  vendorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

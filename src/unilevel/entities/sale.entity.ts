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
    default: LotTransactionRole.SELLER,
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

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  projectName?: string;

  // Montos de reserva
  @Column({ type: 'numeric', scale: 2, nullable: true })
  reservationAmount?: number;

  @Column({ type: 'numeric', scale: 2, nullable: true, default: 0 })
  reservationAmountPaid?: number;

  @Column({ type: 'numeric', scale: 2, nullable: true })
  reservationAmountPending?: number;

  // Montos totales de la venta (lote)
  @Column({ type: 'numeric', scale: 2, nullable: true, default: 0 })
  totalAmountPaid?: number;

  @Column({ type: 'numeric', scale: 2, nullable: true })
  totalAmountPending?: number;

  // Montos de inicial (financiado)
  @Column({ type: 'numeric', scale: 2, nullable: true, default: 0 })
  initialAmountPaid?: number;

  @Column({ type: 'numeric', scale: 2, nullable: true })
  initialAmountPending?: number;

  @Column({
    type: 'json',
    nullable: true,
  })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

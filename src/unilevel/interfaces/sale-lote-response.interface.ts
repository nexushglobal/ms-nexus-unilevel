import { CurrencyType } from '../enums/currency-type.enum';
import { LotTransactionRole } from '../enums/lot-transaction-role.enum';
import { SaleType } from '../enums/sale-type.enum';
import { StatusSale } from '../enums/status-sale.enum';

export interface SaleLoteResponse {
  id: string;
  clientFullName: string;
  phone?: string;
  currency: CurrencyType;
  amount: number;
  amountInitial?: number;
  numberCoutes?: number;
  type: SaleType;
  status: StatusSale;
  saleIdReference: string;
  vendorId: string;
  lotTransactionRole: LotTransactionRole;
  metadata?: Record<string, any>;
  createdAt: Date;
}

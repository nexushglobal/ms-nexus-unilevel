import { Sale } from '../entities/sale.entity';
import { SaleLoteResponse } from '../interfaces/sale-lote-response.interface';

export const formatSaleResponse = (sale: Sale): SaleLoteResponse => {
  return {
    id: sale.id,
    clientFullName: sale.clientFullName,
    phone: sale.phone,
    currency: sale.currency,
    amount: sale.amount,
    amountInitial: sale.amountInitial,
    numberCoutes: sale.numberCoutes,
    type: sale.type,
    status: sale.status,
    saleIdReference: sale.saleIdReference,
    vendorId: sale.vendorId,
    lotTransactionRole: sale.lotTransactionRole,
    reservationAmount: sale.reservationAmount,
    reservationAmountPaid: sale.reservationAmountPaid,
    reservationAmountPending: sale.reservationAmountPending,
    totalAmountPaid: sale.totalAmountPaid,
    totalAmountPending: sale.totalAmountPending,
    initialAmountPaid: sale.initialAmountPaid,
    initialAmountPending: sale.initialAmountPending,
    metadata: sale.metadata,
    createdAt: sale.createdAt,
  };
};

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
  };
};

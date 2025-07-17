import { CreateFinancingInstallmentsDto } from '../dto/create-financing-installments.dto';

export interface CalculateAmortizationResponse {
  installments: CreateFinancingInstallmentsDto[];
  meta: {
    totalCouteAmountSum: number;
  };
}

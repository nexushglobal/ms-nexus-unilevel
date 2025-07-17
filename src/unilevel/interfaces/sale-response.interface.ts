import { StatusFinancingInstallments } from '../enums/status-financing-installments.enum';
import { CurrencyType } from '../enums/currency-type.enum';
import { StatusPayment } from '../enums/status-payments.enum';

export interface SaleResponse {
  id: string;
  type: string;
  totalAmount: number;
  contractDate: string;
  status: string;
  currency: CurrencyType;
  createdAt: string;
  reservationAmount?: number;
  maximumHoldPeriod?: number;
  fromReservation?: boolean;
  client: {
    address: string;
    firstName: string;
    lastName: string;
    phone: string;
    reportPdfUrl: string | null;
  };
  secondaryClients: {
    address: string;
    firstName: string;
    lastName: string;
    phone: string;
  }[];
  lot: {
    id: string;
    name: string;
    lotPrice: number;
    block: string;
    stage: string;
    project: string;
  };
  radicationPdfUrl: string | null;
  paymentAcordPdfUrl: string | null;
  financing: {
    id: string;
    initialAmount: number;
    interestRate: number;
    quantityCoutes: number;
    // AGREGAR ESTO:
    financingInstallments: {
      id: string;
      couteAmount: number;
      coutePending: number;
      coutePaid: number;
      expectedPaymentDate: string;
      lateFeeAmountPending: number;
      lateFeeAmountPaid: number;
      status: StatusFinancingInstallments;
    }[];
  };
  guarantor: {
    firstName: string;
    lastName: string;
  };
  liner?: {
    firstName: string;
    lastName: string;
  };
  telemarketingSupervisor?: {
    firstName: string;
    lastName: string;
  };
  telemarketingConfirmer?: {
    firstName: string;
    lastName: string;
  };
  telemarketer?: {
    firstName: string;
    lastName: string;
  };
  fieldManager?: {
    firstName: string;
    lastName: string;
  };
  fieldSupervisor?: {
    firstName: string;
    lastName: string;
  };
  fieldSeller?: {
    firstName: string;
    lastName: string;
  };
  // reservation: {
  //   id: string;
  //   amount: number;
  // };
  vendor: {
    document: string;
    firstName: string;
    lastName: string;
  };
  paymentsSummary?: {
    id: number;
    amount: number;
    status: StatusPayment;
    createdAt: string;
    reviewedAt: string | null;
    codeOperation: string | null;
    banckName: string | null;
    dateOperation: string | null;
    numberTicket: string | null;
    paymentConfig: string;
    reason: string | null;
  }[];
}

export enum StatusSale {
  // Reserva
  RESERVATION_PENDING = 'RESERVATION_PENDING', // Reserva registrada, sin pagos
  RESERVATION_PENDING_APPROVAL = 'RESERVATION_PENDING_APPROVAL', // Pago de reserva pendiente de aprobacion
  RESERVATION_IN_PAYMENT = 'RESERVATION_IN_PAYMENT', // Pago parcial de reserva aprobado, aun falta
  RESERVED = 'RESERVED', // Reserva completada y aprobada

  // Venta directa / fase inicial de financiada
  PENDING = 'PENDING', // Venta creada, sin pagos
  PENDING_APPROVAL = 'PENDING_APPROVAL', // Pago pendiente de aprobacion
  IN_PAYMENT = 'IN_PAYMENT', // Pago parcial aprobado, aun falta
  APPROVED = 'APPROVED', // Venta aprobada (compatibilidad)
  COMPLETED = 'COMPLETED', // Totalmente pagada

  // Venta financiada
  IN_PAYMENT_PROCESS = 'IN_PAYMENT_PROCESS', // Inicial aprobada, pagando cuotas

  // Finales
  REJECTED = 'REJECTED', // Rechazada
  WITHDRAWN = 'WITHDRAWN', // Retirada/anulada
}

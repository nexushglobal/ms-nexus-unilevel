export enum StatusSale {
  // Estados de Venta
  PENDING = 'PENDING', // Venta pendiente de procesamiento
  PENDING_APPROVAL = 'PENDING_APPROVAL', // Venta pendiente de aprobación
  APPROVED = 'APPROVED', // Venta aprobada
  IN_PAYMENT_PROCESS = 'IN_PAYMENT_PROCESS', // En proceso de pago
  COMPLETED = 'COMPLETED', // Venta completada
  REJECTED = 'REJECTED', // Rechazada (incluye reservas rechazadas/expiradas)
  WITHDRAWN = 'WITHDRAWN', // Retirada (incluye reservas anuladas)
}

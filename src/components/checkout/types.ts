export interface PaymentInfo {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
  paymentMethod: 'card' | 'stripe' | 'tilopay' | 'mobile_bank_transfer' | 'bank_transfer'
}

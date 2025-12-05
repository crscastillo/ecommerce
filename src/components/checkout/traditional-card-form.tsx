'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


import type { PaymentInfo } from './types'

interface TraditionalCardFormProps {
  paymentInfo: PaymentInfo
  onUpdate: (info: PaymentInfo) => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
}

export function TraditionalCardForm({ paymentInfo, onUpdate, onSubmit, onBack }: TraditionalCardFormProps) {
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleChange = (field: keyof PaymentInfo, formatter?: (value: string) => string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = formatter ? formatter(e.target.value) : e.target.value
    onUpdate({ ...paymentInfo, [field]: value })
  }

  return (
    <div className="mt-4">
      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
        <div>
          <Label htmlFor="cardholderName">Cardholder Name *</Label>
          <Input
            id="cardholderName"
            value={paymentInfo.cardholderName}
            onChange={handleChange('cardholderName')}
            className="h-12"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="cardNumber">Card Number *</Label>
          <Input
            id="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={paymentInfo.cardNumber}
            onChange={handleChange('cardNumber', formatCardNumber)}
            maxLength={19}
            className="h-12"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <Label htmlFor="expiryDate">Expiry Date *</Label>
            <Input
              id="expiryDate"
              placeholder="MM/YY"
              value={paymentInfo.expiryDate}
              onChange={handleChange('expiryDate', formatExpiryDate)}
              maxLength={5}
              className="h-12"
              required
            />
          </div>
          <div>
            <Label htmlFor="cvv">CVV *</Label>
            <Input
              id="cvv"
              placeholder="123"
              value={paymentInfo.cvv}
              onChange={handleChange('cvv')}
              className="h-12"
              required
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            className="flex-1 min-h-[48px]"
            size="lg"
          >
            Back to Shipping
          </Button>
          <Button type="submit" className="flex-1 min-h-[48px]" size="lg">
            Review Order
          </Button>
        </div>
      </form>
    </div>
  )
}

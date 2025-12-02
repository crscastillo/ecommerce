'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Truck } from 'lucide-react'

interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface ShippingFormProps {
  shippingInfo: ShippingInfo
  onUpdate: (info: ShippingInfo) => void
  onSubmit: (e: React.FormEvent) => void
  showSubmitButton?: boolean
}

export function ShippingForm({ shippingInfo, onUpdate, onSubmit, showSubmitButton = true }: ShippingFormProps) {
  const handleChange = (field: keyof ShippingInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...shippingInfo, [field]: e.target.value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Truck className="w-5 h-5 mr-2" />
          Shipping Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={shippingInfo.firstName}
                onChange={handleChange('firstName')}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={shippingInfo.lastName}
                onChange={handleChange('lastName')}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={shippingInfo.email}
              onChange={handleChange('email')}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={shippingInfo.phone}
              onChange={handleChange('phone')}
            />
          </div>
          
          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={shippingInfo.address}
              onChange={handleChange('address')}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={shippingInfo.city}
                onChange={handleChange('city')}
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={shippingInfo.state}
                onChange={handleChange('state')}
                required
              />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                value={shippingInfo.zipCode}
                onChange={handleChange('zipCode')}
                required
              />
            </div>
          </div>
          
          {showSubmitButton && (
            <Button type="submit" className="w-full mt-6">
              Continue to Payment
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

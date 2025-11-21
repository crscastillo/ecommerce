import { useState } from 'react'
import { useCart } from '@/lib/contexts/cart-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils/currency'

const PAYMENT_METHODS = [
  { id: 'mobile_bank_transfer', label: 'Mobile Bank Transfer' },
  { id: 'tilopay', label: 'Tilopay' },
]

export default function CheckoutForm() {
  const { items, getTotalPrice, clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate payment processing
    await new Promise(res => setTimeout(res, 1200))
    setSuccess(true)
    clearCart()
    setIsSubmitting(false)
    // Optionally redirect or show confirmation
  }

  if (success) {
    return (
      <Card className="max-w-lg mx-auto mt-12">
        <CardHeader>
          <CardTitle>Order Confirmed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Thank you for your purchase! Your order has been placed.</p>
          <Button onClick={() => router.push('/products')}>Continue Shopping</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-12">
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="mb-4">
            {items.map(item => (
              <li key={item.id} className="flex justify-between py-2 border-b last:border-b-0">
                <span>{item.name} x {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span>{formatPrice(getTotalPrice())}</span>
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-medium">Payment Method</label>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(method => (
                <label key={method.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="accent-primary"
                  />
                  {method.label}
                </label>
              ))}
            </div>
          </div>
          {paymentMethod === 'mobile_bank_transfer' && (
            <div className="mb-6">
              <label className="block mb-2 font-medium">Mobile Bank Transfer Instructions</label>
              <div className="bg-gray-100 p-4 rounded">
                <p>Send your payment to the following bank account:</p>
                <p className="mt-2 font-mono">Account: 123456789<br />Bank: Example Bank<br />Phone: +1234567890</p>
                <p className="mt-2 text-sm text-gray-600">After payment, please reply to the confirmation email with your transaction receipt.</p>
              </div>
            </div>
          )}
          {paymentMethod === 'tilopay' && (
            <div className="mb-6">
              <label className="block mb-2 font-medium">Tilopay Instructions</label>
              <div className="bg-gray-100 p-4 rounded">
                <p>You'll be redirected to Tilopay to complete your payment securely.</p>
              </div>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Place Order'}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}

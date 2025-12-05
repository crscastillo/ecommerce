'use client'

import { Truck, CreditCard, Shield } from 'lucide-react'

interface CheckoutStepsProps {
  currentStep: 'shipping' | 'payment' | 'review'
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const steps = [
    { step: 'shipping', label: 'Shipping', icon: Truck },
    { step: 'payment', label: 'Payment', icon: CreditCard },
    { step: 'review', label: 'Review', icon: Shield }
  ] as const

  const stepOrder: Record<typeof steps[number]['step'], number> = {
    shipping: 0,
    payment: 1,
    review: 2
  }

  const currentStepIndex = stepOrder[currentStep]

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-8">
        {steps.map(({ step, label, icon: Icon }, index) => (
          <div key={step} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep === step 
                ? 'border-blue-600 bg-blue-600 text-white' 
                : index < currentStepIndex
                ? 'border-green-600 bg-green-600 text-white'
                : 'border-border text-muted-foreground'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className={`ml-2 font-medium ${
              currentStep === step ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {label}
            </span>
            {index < 2 && (
              <div className={`w-16 h-0.5 mx-4 ${
                index < currentStepIndex
                  ? 'bg-green-600'
                  : 'bg-border'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

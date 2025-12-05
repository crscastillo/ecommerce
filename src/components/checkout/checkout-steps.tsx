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
    <div className="mb-6 sm:mb-8">
      {/* Mobile Layout */}
      <div className="sm:hidden">
        <div className="flex justify-between mb-2">
          {steps.map(({ step, label, icon: Icon }, index) => (
            <div key={step} className="flex flex-col items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 mb-1 ${
                currentStep === step 
                  ? 'border-blue-600 bg-blue-600 text-white' 
                  : index < currentStepIndex
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-border text-muted-foreground'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-xs font-medium text-center ${
                currentStep === step ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>
        {/* Mobile Progress Bar */}
        <div className="flex items-center mt-3">
          <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-600 to-blue-600 transition-all duration-500"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex items-center justify-center space-x-8">
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

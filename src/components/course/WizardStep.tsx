'use client'

import { ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'

interface WizardStepProps {
  children: ReactNode
  step: number
  currentStep: number
  title: string
  description: string
  icon: ReactNode
  onNext?: () => boolean | Promise<boolean>
  onBack?: () => void
  isLast?: boolean
  isValid?: boolean
}

const STEP_LABELS = ['Frame', 'Structure', 'Competencies', 'Assess', 'Pathways', 'Review']

export function WizardStep({ children, step, currentStep, title, description, onNext, onBack, isLast, isValid }: WizardStepProps) {
  const canProceed = isValid !== false

  const handleNext = async () => {
    if (onNext) {
      const result = await onNext()
      if (!result) return
    }
  }

  if (step !== currentStep) return null

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
          {step}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>

      <div className="ml-0 md:ml-14">
        {children}
      </div>

      <div className="ml-0 md:ml-14 flex items-center justify-between pt-4 border-t">
        <div>
          {onBack && step > 1 && (
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Back
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!isLast ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed}
              className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continue →
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canProceed}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              Publish Course
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface StepIndicatorProps {
  currentStep: number
  steps: { label: string; icon: ReactNode }[]
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((s, i) => {
        const isActive = i === currentStep
        const isComplete = i < currentStep
        return (
          <div key={i} className="flex items-center gap-2">
            <div className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
              isActive && 'bg-primary text-white',
              isComplete && 'bg-green-100 text-green-700',
              !isActive && !isComplete && 'bg-gray-100 text-gray-400',
            )}>
              {isComplete ? '✓' : i + 1}
            </div>
            <span className={cn(
              'text-xs font-medium hidden md:inline',
              isActive && 'text-primary',
              isComplete && 'text-green-700',
              !isActive && !isComplete && 'text-gray-400',
            )}>{s.label}</span>
            {i < steps.length - 1 && (
              <div className={cn('h-0.5 w-6 md:w-12 mx-1', isComplete ? 'bg-green-200' : 'bg-gray-200')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

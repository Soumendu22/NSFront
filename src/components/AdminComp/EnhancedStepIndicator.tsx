"use client";

import React from 'react';
import { Check, Circle, ArrowRight } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  completedSteps?: Set<number>;
  isEditMode?: boolean;
}

export const EnhancedStepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
  completedSteps = new Set(),
  isEditMode = false
}) => {
  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.has(stepNumber)) return 'completed';
    if (stepNumber === currentStep) return 'current';
    if (stepNumber < currentStep) return 'completed';
    return 'upcoming';
  };

  const getStepIcon = (stepNumber: number, status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-5 h-5 text-white" />;
      case 'current':
        return <Circle className="w-5 h-5 text-white fill-current" />;
      default:
        return <span className="text-sm font-medium text-gray-400">{stepNumber}</span>;
    }
  };

  const getStepClasses = (status: string) => {
    const baseClasses = "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 backdrop-blur-sm";

    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-500/80 border-green-400 shadow-lg shadow-green-500/25`;
      case 'current':
        return `${baseClasses} bg-purple-600/80 border-purple-400 shadow-lg shadow-purple-600/25 ring-4 ring-purple-600/20`;
      default:
        return `${baseClasses} bg-white/10 border-white/30 hover:border-white/50`;
    }
  };

  const getConnectorClasses = (stepNumber: number) => {
    const isCompleted = getStepStatus(stepNumber) === 'completed' || getStepStatus(stepNumber + 1) === 'completed' || stepNumber < currentStep;
    return `flex-1 h-0.5 mx-2 transition-all duration-500 ${
      isCompleted ? 'bg-gradient-to-r from-green-500 to-purple-600' : 'bg-gray-600'
    }`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Mode Indicator */}
      {isEditMode && (
        <div className="mb-6 text-center">
          <div className="inline-flex items-center px-4 py-2 border rounded-full bg-white/10 backdrop-blur-md border-white/20">
            <div className="w-2 h-2 mr-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-400">Update Mode</span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 text-sm text-gray-300">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="w-full h-2 overflow-hidden rounded-full bg-white/20 backdrop-blur-sm">
          <div
            className="h-full transition-all duration-500 ease-out bg-gradient-to-r from-purple-500 to-blue-500"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          >
            <div className="h-full bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const status = getStepStatus(stepNumber);
          
          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center group">
                {/* Step Circle */}
                <div className={getStepClasses(status)}>
                  {getStepIcon(stepNumber, status)}
                </div>
                
                {/* Step Title */}
                <div className="mt-3 text-center max-w-24">
                  <div className={`text-xs font-medium transition-colors duration-200 ${
                    status === 'current' 
                      ? 'text-purple-400' 
                      : status === 'completed' 
                        ? 'text-green-400' 
                        : 'text-gray-500'
                  }`}>
                    {stepTitles[index] || `Step ${stepNumber}`}
                  </div>
                </div>
              </div>
              
              {/* Connector Line */}
              {stepNumber < totalSteps && (
                <div className={getConnectorClasses(stepNumber)}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Current Step Description */}
      <div className="mt-6 text-center">
        <h2 className="text-2xl font-bold text-white">
          {stepTitles[currentStep - 1] || `Step ${currentStep}`}
        </h2>
        <p className="mt-1 text-sm text-gray-300">
          {isEditMode ? 'Update your information below' : 'Complete the form below to continue'}
        </p>
      </div>
    </div>
  );
};

// Step titles for the admin setup form
export const ADMIN_SETUP_STEPS = [
  'Basic Details',
  'Admin Details', 
  'Security',
  'Security Setup',
  'Agreements',
  'Review & Submit'
];

"use client";

import React from "react";
import { CheckCircle, Circle, ChevronRight } from "lucide-react";

type Step = {
  label: string;
  description: string;
};

const STEPS: Step[] = [
  { label: "Basic Details", description: "Company and contact info" },
  { label: "Admin Personal Details", description: "Your personal info" },
  { label: "Security Preferences", description: "Alert and MFA settings" },
  { label: "Initial Security Setup", description: "Endpoint configurations" },
  { label: "Agreements and Setup", description: "Accept policies" },
  { label: "Review and Submit", description: "Finalize your setup" },
];

interface Props {
  currentStep: number;
  setStep: (step: number) => void;
}

export default function AdminSidebar({ currentStep, setStep }: Props) {
  return (
    <div className="flex flex-col p-4 m-6 space-y-6 text-gray-300 bg-gray-900 rounded-lg h-170 w-82">
      <h2 className="mb-4 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-white">
        Setup Progress
      </h2>
      <nav className="flex flex-col space-y-4">
        {STEPS.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCurrent = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;
          return (
            <button
              key={step.label}
              onClick={() => setStep(stepNumber)}
              disabled={stepNumber > currentStep} // optionally disable future steps
              className={`flex items-center space-x-4 rounded-md px-3 py-2 transition-colors
                ${
                  isCurrent
                    ? "bg-purple-700 text-white shadow-lg font-semibold"
                    : isCompleted
                    ? "text-green-400 hover:bg-gray-800"
                    : "hover:bg-gray-800 cursor-pointer"
                }
                ${stepNumber > currentStep ? "cursor-not-allowed opacity-50" : ""}
              `}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span>
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <Circle className={`w-6 h-6 ${isCurrent ? "text-purple-400" : "text-gray-600"}`} />
                )}
              </span>
              <div className="flex flex-col text-left">
                <span>{step.label}</span>
                <span className="text-xs text-gray-500">{step.description}</span>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto text-gray-500" />
            </button>
          );
        })}
      </nav>
    </div>
  );
}

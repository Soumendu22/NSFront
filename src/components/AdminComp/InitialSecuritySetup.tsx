"use client";

import React from "react";
import { ValidatedInput, ValidatedSelect } from "@/components/ui/validated-input";
import {
  validateNumber,
  validateRequired,
  ValidationResult,
  FieldValidation
} from "@/utils/validation";

type Props = {
  formData: any;
  updateForm: (fields: Partial<any>) => void;
  onValidationChange?: (isValid: boolean, errors: FieldValidation) => void;
};

export default function InitialSecuritySetup({ formData, updateForm, onValidationChange }: Props) {
  const [validationErrors, setValidationErrors] = React.useState<FieldValidation>({});
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());

  // Validation functions
  const validateField = (fieldName: string, value: any): ValidationResult => {
    switch (fieldName) {
      case 'endpointLimit':
        return validateNumber(value, 'Endpoint limit', 1, 10000);
      case 'threatResponseMode':
        return validateRequired(value, 'Threat response mode');
      case 'deviceVerificationMethod':
        return validateRequired(value, 'Device verification method');
      default:
        return { isValid: true };
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    updateForm({ [fieldName]: value });

    // Validate field if it has been touched
    if (touchedFields.has(fieldName)) {
      const validation = validateField(fieldName, value);
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: validation
      }));
    }
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
    const validation = validateField(fieldName, formData[fieldName]);
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: validation
    }));
  };

  // Update parent component with validation status
  React.useEffect(() => {
    const allErrors = { ...validationErrors };

    // Validate all required fields
    const requiredFields = ['endpointLimit', 'threatResponseMode', 'deviceVerificationMethod'];
    requiredFields.forEach(field => {
      if (!allErrors[field]) {
        allErrors[field] = validateField(field, formData[field]);
      }
    });

    const hasErrors = Object.values(allErrors).some(error => !error.isValid);
    onValidationChange?.(!hasErrors, allErrors);
  }, [validationErrors, formData.endpointLimit, formData.threatResponseMode, formData.deviceVerificationMethod]);

  // Handle number input
  const handleNumberChange = (value: string) => {
    // Only allow positive integers
    const numValue = value.replace(/[^\d]/g, '');
    handleFieldChange('endpointLimit', numValue ? parseInt(numValue) : '');
  };

  return (
    <div>
      <h2 className="mb-8 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-white">
        Initial Security Setup
      </h2>

      <form className="grid max-w-3xl grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

        {/* Endpoint Limit */}
        <ValidatedInput
          id="endpointLimit"
          label="Endpoint Limit"
          type="number"
          value={formData.endpointLimit?.toString() || ""}
          onChange={handleNumberChange}
          onBlur={() => handleFieldBlur('endpointLimit')}
          validation={validationErrors.endpointLimit}
          placeholder="Enter number of endpoints (1-10000)"
          required
          maxLength={5}
        />

        {/* Threat Response Mode */}
        <ValidatedSelect
          id="threatResponseMode"
          label="Threat Response Mode (Default)"
          value={formData.threatResponseMode}
          onChange={(val) => handleFieldChange('threatResponseMode', val)}
          onBlur={() => handleFieldBlur('threatResponseMode')}
          validation={validationErrors.threatResponseMode}
          options={[
            { value: "Passive", label: "Passive (log only)" },
            { value: "Active", label: "Active (quarantine)" },
            { value: "Manual", label: "Manual" }
          ]}
          placeholder="Select threat response mode"
          required
        />

        {/* Device Verification Method */}
        <div className="md:col-span-2">
          <ValidatedSelect
            id="deviceVerificationMethod"
            label="Device Verification Method"
            value={formData.deviceVerificationMethod}
            onChange={(val) => handleFieldChange('deviceVerificationMethod', val)}
            onBlur={() => handleFieldBlur('deviceVerificationMethod')}
            validation={validationErrors.deviceVerificationMethod}
            options={[
              { value: "IP Matching", label: "IP Matching" },
              { value: "Code Verification", label: "Code Verification" },
              { value: "Manual Review", label: "Manual Review" }
            ]}
            placeholder="Select verification method"
            required
          />
        </div>

      </form>
    </div>
  );
}

"use client";

import React from "react";
import { ValidatedInput, ValidatedCheckbox } from "@/components/ui/validated-input";
import { PrivacyPolicyModal } from "@/components/ui/privacy-policy-modal";
import { TermsConditionsModal } from "@/components/ui/terms-conditions-modal";
import {
  validateEmail,
  validateRequired,
  ValidationResult,
  FieldValidation
} from "@/utils/validation";

type Props = {
  formData: any;
  updateForm: (fields: Partial<any>) => void;
  onValidationChange?: (isValid: boolean, errors: FieldValidation) => void;
};

export default function AgreementsSetup({ formData, updateForm, onValidationChange }: Props) {
  const [validationErrors, setValidationErrors] = React.useState<FieldValidation>({});
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = React.useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = React.useState(false);

  // Validation functions
  const validateField = (fieldName: string, value: any): ValidationResult => {
    switch (fieldName) {
      case 'acceptedTerms':
        return validateRequired(value, 'Terms and conditions acceptance');
      case 'acceptedPrivacyPolicy':
        return validateRequired(value, 'Privacy policy acceptance');
      case 'securityContactEmail':
        return validateEmail(value);
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

  // Modal handlers
  const handlePrivacyAgree = () => {
    handleFieldChange('acceptedPrivacyPolicy', true);
    setIsPrivacyModalOpen(false);
    // Show visual feedback
    setTimeout(() => {
      const element = document.getElementById('acceptPrivacy');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleTermsAgree = () => {
    handleFieldChange('acceptedTerms', true);
    setIsTermsModalOpen(false);
    // Show visual feedback
    setTimeout(() => {
      const element = document.getElementById('acceptTerms');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Update parent component with validation status
  React.useEffect(() => {
    const allErrors: any = { ...validationErrors };

    // Validate all required fields
    const requiredFields = ['acceptedTerms', 'acceptedPrivacyPolicy', 'securityContactEmail'];
    requiredFields.forEach(field => {
      if (!(field in allErrors)) {
        allErrors[field] = validateField(field, formData[field]);
      }
    });

    const hasErrors = Object.values(allErrors).some((error: any) => !error.isValid);
    onValidationChange?.(!hasErrors, allErrors);
  }, [validationErrors, formData.acceptedTerms, formData.acceptedPrivacyPolicy, formData.securityContactEmail, onValidationChange]);

  return (
    <div>
      <h2 className="mb-8 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-white">
        Agreements and Setup
      </h2>

      <form className="max-w-3xl space-y-8">

        {/* Accept Terms */}
        <div className="space-y-2">
          <ValidatedCheckbox
            id="acceptTerms"
            label=""
            checked={formData.acceptedTerms || false}
            onChange={(val) => handleFieldChange('acceptedTerms', val)}
            validation={validationErrors.acceptedTerms as ValidationResult}
          />
          <div className="ml-8">
            <label htmlFor="acceptTerms" className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer -mt-9">
              <span className={`transition-colors duration-300 ${formData.acceptedTerms ? 'text-green-400' : ''}`}>
                I agree to the{' '} 
                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(true)}
                  className="text-purple-400 underline transition-colors hover:text-purple-300 underline-offset-2"
                >
                  Terms and Conditions
                </button>
              </span>
            </label>
            {formData.acceptedTerms && (
              <div className="mt-2 text-sm text-green-400 duration-500 animate-in fade-in-0">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Terms and Conditions Agreed
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Accept Privacy Policy */}
        <div className="space-y-2">
          <ValidatedCheckbox
            id="acceptPrivacy"
            label=""
            checked={formData.acceptedPrivacyPolicy || false}
            onChange={(val) => handleFieldChange('acceptedPrivacyPolicy', val)}
            validation={validationErrors.acceptedPrivacyPolicy as ValidationResult}
          />
          <div className="ml-8">
            <label htmlFor="acceptPrivacy" className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer -mt-9">
              <span className={`transition-colors duration-300 ${formData.acceptedPrivacyPolicy ? 'text-green-400' : ''}`}>
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="text-purple-400 underline transition-colors hover:text-purple-300 underline-offset-2"
                >
                  Privacy Policy
                </button>
              </span>
            </label>
            {formData.acceptedPrivacyPolicy && (
              <div className="mt-2 text-sm text-green-400 duration-500 animate-in fade-in-0">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Privacy Policy Agreed
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Company Security Contact Email */}
        <ValidatedInput
          id="securityContactEmail"
          label="Company Security Contact Email"
          type="email"
          value={formData.securityContactEmail || ""}
          onChange={(val) => handleFieldChange('securityContactEmail', val)}
          onBlur={() => handleFieldBlur('securityContactEmail')}
          validation={validationErrors.securityContactEmail as ValidationResult}
          placeholder="security@example.com"
          required
          maxLength={100}
        />
      </form>

      {/* Modals */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onAgree={handlePrivacyAgree}
      />

      <TermsConditionsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAgree={handleTermsAgree}
      />
    </div>
  );
}

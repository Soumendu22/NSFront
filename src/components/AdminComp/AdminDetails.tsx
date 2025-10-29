"use client";

import React from "react";
import { ValidatedInput } from "@/components/ui/validated-input";
import {
  validateText,
  validateEmail,
  validatePhoneNumber,
  ValidationResult
} from "@/utils/validation";

type Props = {
  formData: any;
  updateForm: (fields: Partial<any>) => void;
  onValidationChange?: (isValid: boolean, errors: Record<string, ValidationResult>) => void;
};

export default function AdminDetails({ formData, updateForm, onValidationChange }: Props) {
  const [validationErrors, setValidationErrors] = React.useState<Record<string, ValidationResult>>({});
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());

  // IP address validation function
  const validateIPAddress = (ip: string): ValidationResult => {
    if (!ip || ip.trim() === '') {
      return { isValid: false, error: 'IP address is required' };
    }

    // IPv4 validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    // IPv6 validation (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

    if (ipv4Regex.test(ip.trim()) || ipv6Regex.test(ip.trim())) {
      return { isValid: true };
    }

    return { isValid: false, error: 'Please enter a valid IPv4 or IPv6 address' };
  };

  // Validation functions
  const validateField = (fieldName: string, value: any): ValidationResult => {
    switch (fieldName) {
      case 'fullName':
        return validateText(value, 'Full name', 2, 100);
      case 'role':
        return validateText(value, 'Role', 2, 50);
      case 'phoneNumber':
        return validatePhoneNumber(value, false);
      case 'backupEmail':
        return value ? validateEmail(value) : { isValid: true };
      case 'ip_address':
        return validateIPAddress(value);
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
    const requiredFields = ['fullName', 'role', 'ip_address'];
    requiredFields.forEach(field => {
      if (!allErrors[field]) {
        allErrors[field] = validateField(field, formData[field]);
      }
    });

    const hasErrors = Object.values(allErrors).some(error => !error.isValid);
    onValidationChange?.(!hasErrors, allErrors);
  }, [validationErrors, formData.fullName, formData.role, formData.ip_address, formData.phoneNumber, formData.backupEmail]);

  // Phone number formatting
  const handlePhoneChange = (value: string) => {
    // Allow only valid phone characters
    const cleanValue = value.replace(/[^\d\s\-\+\(\)]/g, '');
    handleFieldChange('phoneNumber', cleanValue);
  };

  return (
    <div>
      <h2 className="mb-8 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-white">
        Admin Personal Details
      </h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Full Name */}
        <ValidatedInput
          id="fullName"
          label="Full Name"
          value={formData.fullName || ""}
          onChange={(val) => handleFieldChange('fullName', val)}
          onBlur={() => handleFieldBlur('fullName')}
          validation={validationErrors.fullName}
          placeholder="Enter your full name"
          required
          maxLength={100}
        />

        {/* Role / Designation */}
        <ValidatedInput
          id="role"
          label="Role / Designation"
          value={formData.role || ""}
          onChange={(val) => handleFieldChange('role', val)}
          onBlur={() => handleFieldBlur('role')}
          validation={validationErrors.role}
          placeholder="Enter your role or designation"
          required
          maxLength={50}
        />

        {/* Phone Number */}
        <ValidatedInput
          id="phoneNumber"
          label="Phone Number (optional)"
          type="tel"
          value={formData.phoneNumber || ""}
          onChange={handlePhoneChange}
          onBlur={() => handleFieldBlur('phoneNumber')}
          validation={validationErrors.phoneNumber}
          placeholder="+1 (555) 123-4567"
          maxLength={20}
        />

        {/* Backup Email */}
        <ValidatedInput
          id="backupEmail"
          label="Backup Email (optional)"
          type="email"
          value={formData.backupEmail || ""}
          onChange={(val) => handleFieldChange('backupEmail', val)}
          onBlur={() => handleFieldBlur('backupEmail')}
          validation={validationErrors.backupEmail}
          placeholder="backup@example.com"
          maxLength={100}
        />

        {/* IP Address */}
        <ValidatedInput
          id="ip_address"
          label="IP Address"
          type="text"
          value={formData.ip_address || ""}
          onChange={(val) => handleFieldChange('ip_address', val)}
          onBlur={() => handleFieldBlur('ip_address')}
          validation={validationErrors.ip_address}
          placeholder="Enter your IP address (e.g., 192.168.1.100)"
          required
          maxLength={45}
        />
      </form>
    </div>
  );
}

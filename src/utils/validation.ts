// Validation utilities for NexusSentinel admin setup form

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FieldValidation {
  isValid: boolean;
  message?: string;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, error: "Email is required" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  return { isValid: true };
};

// Phone number validation
export const validatePhoneNumber = (phone: string, required: boolean = false): ValidationResult => {
  if (!phone.trim()) {
    return required 
      ? { isValid: false, error: "Phone number is required" }
      : { isValid: true };
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length < 10) {
    return { isValid: false, error: "Phone number must be at least 10 digits" };
  }
  
  if (digitsOnly.length > 15) {
    return { isValid: false, error: "Phone number cannot exceed 15 digits" };
  }
  
  return { isValid: true };
};

// URL validation
export const validateURL = (url: string, required: boolean = false): ValidationResult => {
  if (!url.trim()) {
    return required 
      ? { isValid: false, error: "Website URL is required" }
      : { isValid: true };
  }
  
  try {
    // Add protocol if missing
    const urlToTest = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;
    
    new URL(urlToTest);
    return { isValid: true };
  } catch {
    return { isValid: false, error: "Please enter a valid URL (e.g., example.com)" };
  }
};

// Text field validation
export const validateText = (
  text: string, 
  fieldName: string, 
  minLength: number = 2, 
  maxLength: number = 100,
  required: boolean = true
): ValidationResult => {
  if (!text.trim()) {
    return required 
      ? { isValid: false, error: `${fieldName} is required` }
      : { isValid: true };
  }
  
  if (text.trim().length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  
  if (text.trim().length > maxLength) {
    return { isValid: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
  }
  
  return { isValid: true };
};

// Number validation
export const validateNumber = (
  value: string | number, 
  fieldName: string,
  min: number = 1,
  max: number = 999999,
  required: boolean = true
): ValidationResult => {
  const stringValue = String(value).trim();
  
  if (!stringValue) {
    return required 
      ? { isValid: false, error: `${fieldName} is required` }
      : { isValid: true };
  }
  
  const numValue = Number(stringValue);
  
  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  
  if (!Number.isInteger(numValue)) {
    return { isValid: false, error: `${fieldName} must be a whole number` };
  }
  
  if (numValue < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }
  
  if (numValue > max) {
    return { isValid: false, error: `${fieldName} cannot exceed ${max}` };
  }
  
  return { isValid: true };
};

// Required field validation
export const validateRequired = (value: string | boolean, fieldName: string): ValidationResult => {
  if (typeof value === 'boolean') {
    return value 
      ? { isValid: true }
      : { isValid: false, error: `${fieldName} is required` };
  }
  
  return value && value.toString().trim() 
    ? { isValid: true }
    : { isValid: false, error: `${fieldName} is required` };
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }
  
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+1 (${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`;
  }
  
  return phone; // Return as-is if doesn't match common formats
};

// Restrict input to numbers only
export const restrictToNumbers = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Validate all fields in a step
export const validateStep = (stepData: any, stepNumber: number): FieldValidation => {
  const errors: FieldValidation = {};
  
  switch (stepNumber) {
    case 1: // Basic Details
      errors.companyName = validateText(stepData.companyName, "Company name", 2, 100);
      errors.email = validateEmail(stepData.email);
      errors.companySize = validateRequired(stepData.companySize, "Company size");
      errors.industry = validateRequired(stepData.industry, "Industry");
      errors.website = validateURL(stepData.website, false);
      errors.ceoName = validateText(stepData.ceoName, "CEO name", 2, 100, false);
      errors.contactNumber = validatePhoneNumber(stepData.contactNumber, false);
      break;
      
    case 2: // Admin Details
      errors.fullName = validateText(stepData.fullName, "Full name", 2, 100);
      errors.role = validateText(stepData.role, "Role", 2, 50);
      errors.phoneNumber = validatePhoneNumber(stepData.phoneNumber, false);
      errors.backupEmail = stepData.backupEmail ? validateEmail(stepData.backupEmail) : { isValid: true };
      break;
      
    case 4: // Initial Security Setup
      errors.endpointLimit = validateNumber(stepData.endpointLimit, "Endpoint limit", 1, 10000);
      errors.threatResponseMode = validateRequired(stepData.threatResponseMode, "Threat response mode");
      errors.deviceVerificationMethod = validateRequired(stepData.deviceVerificationMethod, "Device verification method");
      break;
      
    case 5: // Agreements Setup
      errors.acceptedTerms = validateRequired(stepData.acceptedTerms, "Terms and conditions acceptance");
      errors.acceptedPrivacyPolicy = validateRequired(stepData.acceptedPrivacyPolicy, "Privacy policy acceptance");
      errors.securityContactEmail = validateEmail(stepData.securityContactEmail);
      break;
  }
  
  return errors;
};

// Check if step has any validation errors
export const hasValidationErrors = (validationResults: FieldValidation): boolean => {
  return Object.values(validationResults).some(result => !result.isValid);
};

// Get all error messages from validation results
export const getErrorMessages = (validationResults: FieldValidation): string[] => {
  return Object.values(validationResults)
    .filter(result => !result.isValid && result.error)
    .map(result => result.error!);
};

// Generic field validation function for endpoint signup
export const validateField = (fieldName: string, value: string): FieldValidation => {
  switch (fieldName) {
    case 'fullName':
      if (!value.trim()) {
        return { isValid: false, message: 'Full name is required' };
      }
      if (value.trim().length < 2) {
        return { isValid: false, message: 'Full name must be at least 2 characters' };
      }
      return { isValid: true };

    case 'email':
      const emailResult = validateEmail(value);
      return {
        isValid: emailResult.isValid,
        message: emailResult.error
      };

    case 'phoneNumber':
      const phoneResult = validatePhoneNumber(value, true);
      return {
        isValid: phoneResult.isValid,
        message: phoneResult.error
      };

    case 'organizationId':
      if (!value.trim()) {
        return { isValid: false, message: 'Please select an organization' };
      }
      return { isValid: true };

    case 'organizationCompanyName':
      if (!value.trim()) {
        return { isValid: false, message: 'Organization company name is required' };
      }
      return { isValid: true };

    default:
      // For unknown fields, just check if they're not empty
      if (!value.trim()) {
        return { isValid: false, message: `${fieldName} is required` };
      }
      return { isValid: true };
  }
};

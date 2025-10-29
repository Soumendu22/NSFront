import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ValidationResult } from '@/utils/validation';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ValidatedInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  validation?: ValidationResult;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
  autoComplete?: string;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  validation,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  maxLength,
  autoComplete,
}) => {
  const hasError = validation && !validation.isValid;
  const hasSuccess = validation && validation.isValid && value.trim() !== '';

  const inputClasses = `
    transition-all duration-200 ease-in-out
    ${hasError ? 'border-red-400 focus:border-red-300 focus:ring-red-500/20 shadow-lg shadow-red-500/10' : ''}
    ${hasSuccess ? 'border-green-400 focus:border-green-300 focus:ring-green-500/20 shadow-lg shadow-green-500/10' : ''}
    ${!validation ? 'border-white/30 focus:border-purple-400 focus:ring-purple-500/20 hover:border-white/50' : ''}
    bg-white/10 backdrop-blur-md text-white placeholder-gray-300
    rounded-lg px-4 py-3 text-sm
    focus:outline-none focus:ring-2
    ${className}
  `;

  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-sm font-semibold text-gray-200 flex items-center gap-2">
        {label}
        {required && <span className="text-red-400 text-xs">*</span>}
      </Label>

      <div className="relative group">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className={inputClasses}
        />

        {/* Validation Icon */}
        {validation && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            {hasError ? (
              <AlertCircle className="h-5 w-5 text-red-400 animate-pulse" />
            ) : hasSuccess ? (
              <CheckCircle className="h-5 w-5 text-green-400 animate-pulse" />
            ) : null}
          </div>
        )}

        {/* Focus Ring Effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 to-blue-500/0 group-focus-within:from-purple-500/10 group-focus-within:to-blue-500/10 transition-all duration-200 pointer-events-none"></div>
      </div>

      {/* Error Message */}
      {hasError && validation?.error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{validation.error}</p>
        </div>
      )}
    </div>
  );
};

interface ValidatedSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  validation?: ValidationResult;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ValidatedSelect: React.FC<ValidatedSelectProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  validation,
  options,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  className = '',
}) => {
  const hasError = validation && !validation.isValid;
  const hasSuccess = validation && validation.isValid && value !== '';

  const selectClasses = `
    w-full px-4 py-3 rounded-lg border text-sm
    transition-all duration-200 ease-in-out
    ${hasError ? 'border-red-400 focus:border-red-300 focus:ring-red-500/20 shadow-lg shadow-red-500/10' : ''}
    ${hasSuccess ? 'border-green-400 focus:border-green-300 focus:ring-green-500/20 shadow-lg shadow-green-500/10' : ''}
    ${!validation ? 'border-white/30 focus:border-purple-400 focus:ring-purple-500/20 hover:border-white/50' : ''}
    bg-white/10 backdrop-blur-md text-white
    focus:outline-none focus:ring-2
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-sm font-semibold text-gray-200 flex items-center gap-2">
        {label}
        {required && <span className="text-red-400 text-xs">*</span>}
      </Label>

      <div className="relative group">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={selectClasses}
        >
          <option value="" className="bg-black text-gray-400">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-black text-white">
              {option.label}
            </option>
          ))}
        </select>

        {/* Validation Icon */}
        {validation && (
          <div className="absolute inset-y-0 right-10 flex items-center pr-2">
            {hasError ? (
              <AlertCircle className="h-5 w-5 text-red-400 animate-pulse" />
            ) : hasSuccess ? (
              <CheckCircle className="h-5 w-5 text-green-400 animate-pulse" />
            ) : null}
          </div>
        )}

        {/* Focus Ring Effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 to-blue-500/0 group-focus-within:from-purple-500/10 group-focus-within:to-blue-500/10 transition-all duration-200 pointer-events-none"></div>
      </div>

      {/* Error Message */}
      {hasError && validation?.error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{validation.error}</p>
        </div>
      )}
    </div>
  );
};

interface ValidatedCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  validation?: ValidationResult;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ValidatedCheckbox: React.FC<ValidatedCheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  validation,
  required = false,
  disabled = false,
  className = '',
}) => {
  const hasError = validation && !validation.isValid;

  return (
    <div className="space-y-3">
      <div className="flex items-start space-x-4 group">
        <div className="relative">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className={`
              mt-1 h-5 w-5 rounded-md border-2 transition-all duration-200
              ${hasError ? 'border-red-400 focus:ring-red-500/20' : 'border-white/30 focus:ring-purple-500/20'}
              bg-white/10 backdrop-blur-md text-purple-400
              focus:ring-2 focus:ring-offset-0
              hover:border-purple-400
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${className}
            `}
          />
          {checked && (
            <CheckCircle className="absolute -top-0.5 -right-0.5 h-3 w-3 text-green-400 animate-pulse" />
          )}
        </div>
        <Label htmlFor={id} className="text-sm text-gray-200 leading-6 cursor-pointer flex-1">
          {label}
          {required && <span className="text-red-400 ml-1 text-xs">*</span>}
        </Label>
      </div>

      {/* Error Message */}
      {hasError && validation?.error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg ml-9">
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{validation.error}</p>
        </div>
      )}
    </div>
  );
};

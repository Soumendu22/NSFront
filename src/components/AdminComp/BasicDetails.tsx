"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ValidatedInput, ValidatedSelect } from "@/components/ui/validated-input";
import {
  validateText,
  validateURL,
  validatePhoneNumber,
  validateRequired,
  ValidationResult
} from "@/utils/validation";
import { format } from "date-fns";

type Props = {
  formData: any;
  updateForm: (fields: Partial<any>) => void;
  onValidationChange?: (isValid: boolean, errors: Record<string, ValidationResult>) => void;
};

// Country to timezone mapping
const countryTimezoneMap: Record<string, string> = {
  "United States": "America/New_York",
  Canada: "America/Toronto",
  "United Kingdom": "Europe/London",
  India: "Asia/Kolkata",
  Australia: "Australia/Sydney",
  Germany: "Europe/Berlin",
  France: "Europe/Paris",
  Japan: "Asia/Tokyo",
  Others: "",
};

export default function BasicDetails({ formData, updateForm, onValidationChange }: Props) {
  const [open, setOpen] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, ValidationResult>>({});
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());

  // Debug logging
  React.useEffect(() => {
    console.log('BasicDetails - formData:', formData);
    console.log('BasicDetails - companyName:', formData?.companyName);
    console.log('BasicDetails - email:', formData?.email);
  }, [formData]);

  // Parse the date string to Date object if exists, else undefined
  const [date, setDate] = React.useState<Date | undefined>(
    formData.companyRegistrationDate ? new Date(formData.companyRegistrationDate) : undefined
  );

  // Sync date picker changes to form data as ISO string yyyy-mm-dd
  React.useEffect(() => {
    if (date) {
      updateForm({ companyRegistrationDate: date.toISOString().split("T")[0] });
    } else {
      updateForm({ companyRegistrationDate: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // Auto update timezone when country changes
  React.useEffect(() => {
    if (formData.country && countryTimezoneMap[formData.country] !== undefined) {
      updateForm({ timezone: countryTimezoneMap[formData.country] });
    } else {
      updateForm({ timezone: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.country]);

  // Validation functions
  const validateField = (fieldName: string, value: any): ValidationResult => {
    switch (fieldName) {
      case 'companySize':
        return validateRequired(value, 'Company size');
      case 'industry':
        return validateRequired(value, 'Industry');
      case 'otherIndustryText':
        return formData.industry === 'Others'
          ? validateText(value, 'Industry specification', 2, 50)
          : { isValid: true };
      case 'website':
        return validateURL(value, false);
      case 'ceoName':
        return validateText(value, 'CEO name', 2, 100, false);
      case 'contactNumber':
        return validatePhoneNumber(value, false);
      case 'address':
        return validateText(value, 'Address', 10, 500, false);
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
    const requiredFields = ['companySize', 'industry'];
    requiredFields.forEach(field => {
      if (!allErrors[field]) {
        allErrors[field] = validateField(field, formData[field]);
      }
    });

    const hasErrors = Object.values(allErrors).some(error => !error.isValid);
    onValidationChange?.(!hasErrors, allErrors);
  }, [validationErrors, formData.companySize, formData.industry, formData.otherIndustryText]);

  // Contact number formatting
  const handleContactChange = (value: string) => {
    // Allow only valid phone characters
    const cleanValue = value.replace(/[^\d\s\-\+\(\)]/g, '');
    handleFieldChange('contactNumber', cleanValue);
  };

  return (
    <div className="">
      <h2 className="mb-8 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-white">
        Basic Details
      </h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

        {/* Company Name (disabled) */}
        <div>
          <Label htmlFor="companyName" className="block mb-1 font-medium text-gray-300">
            Company Name
          </Label>
          <input
            type="text"
            id="companyName"
            disabled
            value={formData.companyName}
            className="w-full p-2 text-gray-400 border rounded-md cursor-not-allowed bg-gray-800/50"
          />
        </div>

        {/* Username (disabled) */}
        <div>
          <Label htmlFor="email" className="block mb-1 font-medium text-gray-300">
            Username
          </Label>
          <input
            type="text"
            id="email"
            disabled
            value={formData.email || formData.username || 'Loading...'}
            className="w-full p-2 text-gray-400 border rounded-md cursor-not-allowed bg-gray-800/50"
          />
          <p className="mt-1 text-xs text-blue-400">
            This is your login username
          </p>
        </div>

        {/* Company Size */}
        <ValidatedSelect
          id="companySize"
          label="Company Size"
          value={formData.companySize}
          onChange={(val) => handleFieldChange('companySize', val)}
          onBlur={() => handleFieldBlur('companySize')}
          validation={validationErrors.companySize}
          options={[
            { value: "Small", label: "Small" },
            { value: "Medium", label: "Medium" },
            { value: "Large", label: "Large" },
            { value: "Enterprise", label: "Enterprise" }
          ]}
          placeholder="Select company size"
          required
        />

        {/* Industry / Sector */}
        <div className="space-y-2">
          <ValidatedSelect
            id="industry"
            label="Industry / Sector"
            value={formData.industry}
            onChange={(val) => handleFieldChange('industry', val)}
            onBlur={() => handleFieldBlur('industry')}
            validation={validationErrors.industry}
            options={[
              { value: "Technology", label: "Technology" },
              { value: "Finance", label: "Finance" },
              { value: "Healthcare", label: "Healthcare" },
              { value: "Education", label: "Education" },
              { value: "Others", label: "Others" }
            ]}
            placeholder="Select industry"
            required
          />
          {formData.industry === "Others" && (
            <ValidatedInput
              id="otherIndustryText"
              label="Please specify industry"
              value={formData.otherIndustryText || ""}
              onChange={(val) => handleFieldChange('otherIndustryText', val)}
              onBlur={() => handleFieldBlur('otherIndustryText')}
              validation={validationErrors.otherIndustryText}
              placeholder="Enter your industry"
              required
              maxLength={50}
            />
          )}
        </div>

        {/* Website URL */}
        <ValidatedInput
          id="website"
          label="Website URL (optional)"
          type="url"
          value={formData.website || ""}
          onChange={(val) => handleFieldChange('website', val)}
          onBlur={() => handleFieldBlur('website')}
          validation={validationErrors.website}
          placeholder="https://example.com"
          maxLength={200}
        />

        {/* Address textarea (full width) */}
        <div className="md:col-span-2">
          <Label htmlFor="address" className="block mb-1 font-medium text-gray-300">
            Address of Company
          </Label>
          <textarea
            id="address"
            rows={4}
            className="w-full p-2 text-gray-300 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter the full company address"
            value={formData.address || ""}
            onChange={(e) => updateForm({ address: e.target.value })}
          />
        </div>

        {/* CEO Name */}
        <ValidatedInput
          id="ceoName"
          label="CEO Name (optional)"
          value={formData.ceoName || ""}
          onChange={(val) => handleFieldChange('ceoName', val)}
          onBlur={() => handleFieldBlur('ceoName')}
          validation={validationErrors.ceoName}
          placeholder="Enter the CEO's name"
          maxLength={100}
        />

        {/* Company Registration Date with Calendar Popover */}
        <div>
          <Label htmlFor="companyRegistrationDate" className="block mb-1 font-medium text-gray-300">
            Company Registration Date
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                id="companyRegistrationDate"
                variant="outline"
                className={`w-full justify-between font-normal text-left ${!date ? "text-muted-foreground" : ""}`}
              >
                {date ? format(date, "PPP") : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={(selectedDate) => {
                  setDate(selectedDate);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Country */}
        <div>
          <Label htmlFor="country" className="block mb-1 font-medium text-gray-300">
            Country
          </Label>
          <Select
            value={formData.country}
            onValueChange={(val) => updateForm({ country: val })}
          >
            <SelectTrigger id="country" className="w-full">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(countryTimezoneMap).map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timezone (disabled) */}
        <div>
          <Label htmlFor="timezone" className="block mb-1 font-medium text-gray-300">
            Timezone
          </Label>
          <input
            type="text"
            id="timezone"
            disabled
            value={formData.timezone || ""}
            className="w-full p-2 text-gray-400 border rounded-md cursor-not-allowed"
          />
        </div>

        {/* Contact Number */}
        <ValidatedInput
          id="contactNumber"
          label="Contact Number (optional)"
          type="tel"
          value={formData.contactNumber || ""}
          onChange={handleContactChange}
          onBlur={() => handleFieldBlur('contactNumber')}
          validation={validationErrors.contactNumber}
          placeholder="+1 (555) 123-4567"
          maxLength={20}
        />
      </form>
    </div>
  );
}

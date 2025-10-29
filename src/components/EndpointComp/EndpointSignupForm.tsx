"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ValidatedInput, ValidatedSelect } from '@/components/ui/validated-input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { NotificationContainer, useNotifications } from '@/components/ui/notification';
import { validateField, FieldValidation } from '@/utils/validation';
import {
  OS_OPTIONS,
  getVersionsForOS,
  validateIPAddress,
  validateMACAddress,
  formatMACAddress
} from '@/utils/osVersions';
import { CheckCircle, Loader2, Monitor, Users, Shield } from 'lucide-react';
import { API_URLS, apiRequest } from '@/utils/api';

interface Organization {
  value: string;
  label: string;
  company_name: string;
  username: string;
  id: string;
}

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  organizationId: string;
  organizationCompanyName: string;
  operatingSystem: string;
  osVersion: string;
  customOSVersion: string; // For "Other" OS selection
  ipAddress: string;
  macAddress: string;
}

export const EndpointSignupForm: React.FC = () => {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    organizationId: '',
    organizationCompanyName: '',
    operatingSystem: '',
    osVersion: '',
    customOSVersion: '',
    ipAddress: '',
    macAddress: ''
  });



  // UI state
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

  // Notification system
  const { notifications, addNotification, removeNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Validation state
  const [fieldValidations, setFieldValidations] = useState<{ [key: string]: FieldValidation }>({});

  // Load organizations on component mount
  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setIsLoadingOrgs(true);
      const response = await apiRequest(API_URLS.ORGANIZATIONS);

      if (response.ok) {
        const orgs = await response.json();
        setOrganizations(orgs);
      } else {
        console.error('Failed to load organizations');
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Validate field on change
    let validation: FieldValidation;

    if (field === 'ipAddress') {
      validation = validateIPAddress(value);
    } else if (field === 'macAddress') {
      validation = validateMACAddress(value);
    } else {
      validation = validateField(field, value);
    }

    setFieldValidations(prev => ({ ...prev, [field]: validation }));

    // Handle organization selection
    if (field === 'organizationId') {
      const selectedOrg = organizations.find(org => org.value === value);
      if (selectedOrg) {
        setFormData(prev => ({
          ...prev,
          organizationId: selectedOrg.id,
          organizationCompanyName: selectedOrg.company_name
        }));
      }
    }

    // Clear OS version when OS changes
    if (field === 'operatingSystem') {
      setFormData(prev => ({
        ...prev,
        osVersion: '',
        customOSVersion: ''
      }));
    }
  };



  const validateForm = (): boolean => {
    const validations: { [key: string]: FieldValidation } = {};
    let isValid = true;

    // Validate basic required fields
    const basicFields = ['fullName', 'email', 'phoneNumber', 'organizationId', 'operatingSystem'];

    basicFields.forEach(field => {
      const validation = validateField(field, formData[field as keyof FormData]);
      validations[field] = validation;
      if (!validation.isValid) {
        isValid = false;
      }
    });

    // Validate OS version based on OS selection
    if (formData.operatingSystem === 'other') {
      const customOSValidation = validateField('customOSVersion', formData.customOSVersion);
      validations['customOSVersion'] = customOSValidation;
      if (!customOSValidation.isValid) {
        isValid = false;
      }
    } else if (formData.operatingSystem && formData.operatingSystem !== '') {
      const osVersionValidation = validateField('osVersion', formData.osVersion);
      validations['osVersion'] = osVersionValidation;
      if (!osVersionValidation.isValid) {
        isValid = false;
      }
    }

    // Validate IP address
    const ipValidation = validateIPAddress(formData.ipAddress);
    validations['ipAddress'] = ipValidation;
    if (!ipValidation.isValid) {
      isValid = false;
    }

    // Validate MAC address
    const macValidation = validateMACAddress(formData.macAddress);
    validations['macAddress'] = macValidation;
    if (!macValidation.isValid) {
      isValid = false;
    }

    setFieldValidations(validations);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Determine the final OS version value
      const finalOSVersion = formData.operatingSystem === 'other'
        ? formData.customOSVersion
        : formData.osVersion;

      const submitData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        organizationId: formData.organizationId,
        organizationCompanyName: formData.organizationCompanyName,
        operatingSystem: formData.operatingSystem,
        osVersion: finalOSVersion,
        ipAddress: formData.ipAddress,
        macAddress: formatMACAddress(formData.macAddress)
      };

      const response = await apiRequest(API_URLS.ENDPOINT_USERS, {
        method: 'POST',
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (response.ok) {
        // Show success notification
        addNotification(
          'success',
          'Request Submitted Successfully!',
          'Your access request has been submitted. The organization admin will review your request and contact you soon.',
          { duration: 8000 }
        );

        // Clear form
        setFormData({
          fullName: '',
          email: '',
          phoneNumber: '',
          organizationId: '',
          organizationCompanyName: '',
          operatingSystem: '',
          osVersion: '',
          customOSVersion: '',
          ipAddress: '',
          macAddress: ''
        });
        setFieldValidations({});
        setSubmitSuccess(false);
        setSubmitMessage('');

      } else {
        // Show error notification
        addNotification(
          'error',
          'Submission Failed',
          result.message || 'Failed to submit access request. Please check your information and try again.',
          { duration: 10000 }
        );
      }
    } catch (error) {
      console.error('Registration error:', error);

      // Show error notification for network/connection errors
      addNotification(
        'error',
        'Connection Error',
        'Failed to submit request. Please check your internet connection and try again.',
        { duration: 10000 }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Notification Container */}
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="border-b bg-white/10 backdrop-blur-md border-white/20">
          <div className="max-w-4xl px-6 py-8 mx-auto">
            <div className="text-center">
              <h1 className="mb-2 text-3xl font-bold text-white">
                Request Access to NexusSentinel
              </h1>
              <p className="text-gray-300">
                Join an organization's security network by submitting your access request
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="max-w-4xl px-6 py-4 mx-auto">
            <div className="p-4 border bg-green-500/10 backdrop-blur-md border-green-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <p className="font-medium text-green-300">{submitMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="max-w-4xl px-6 py-8 mx-auto">
          <div className="overflow-hidden border shadow-2xl bg-white/10 backdrop-blur-md border-white/20 rounded-2xl">
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              
              {/* Personal Information Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 pb-4 border-b border-white/20">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Shield className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Personal Information
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <ValidatedInput
                    id="fullName"
                    label="Full Name"
                    type="text"
                    value={formData.fullName}
                    onChange={(value) => handleInputChange('fullName', value)}
                    validation={fieldValidations.fullName}
                    placeholder="Enter your full name"
                    required
                  />
                  
                  <ValidatedInput
                    id="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(value) => handleInputChange('email', value)}
                    validation={fieldValidations.email}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                
                <ValidatedInput
                  id="phoneNumber"
                  label="Phone Number"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(value) => handleInputChange('phoneNumber', value)}
                  validation={fieldValidations.phoneNumber}
                  placeholder="Enter your phone number (e.g., +1-555-123-4567)"
                  required
                />
              </div>

              {/* Organization Selection Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 pb-3 border-b border-white/20">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Organization Selection
                  </h2>
                </div>

                {isLoadingOrgs ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 mx-auto mb-3 text-purple-400 animate-spin" />
                      <span className="text-gray-300">Loading organizations...</span>
                    </div>
                  </div>
                ) : (
                  <SearchableSelect
                    label="Select Organization"
                    value={formData.organizationId}
                    onChange={(value) => handleInputChange('organizationId', value)}
                    validation={fieldValidations.organizationId}
                    options={organizations}
                    placeholder="Search and select an organization"
                    searchPlaceholder="Search by company name or username..."
                    emptyMessage="No organizations found"
                    required
                  />
                )}
              </div>

              {/* System Information Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 pb-4 border-b border-white/20">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Monitor className="w-5 h-5 text-green-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    System Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {/* Operating System Selection */}
                  <ValidatedSelect
                    id="operatingSystem"
                    label="Operating System"
                    value={formData.operatingSystem}
                    onChange={(value) => handleInputChange('operatingSystem', value)}
                    validation={fieldValidations.operatingSystem}
                    options={OS_OPTIONS}
                    placeholder="Select Operating System"
                    required
                  />

                  {/* OS Version Selection */}
                  {formData.operatingSystem && formData.operatingSystem !== 'other' && (
                    <ValidatedSelect
                      id="osVersion"
                      label="OS Version"
                      value={formData.osVersion}
                      onChange={(value) => handleInputChange('osVersion', value)}
                      validation={fieldValidations.osVersion}
                      options={getVersionsForOS(formData.operatingSystem)}
                      placeholder="Select Version"
                      required
                    />
                  )}

                  {/* Custom OS Version for "Other" */}
                  {formData.operatingSystem === 'other' && (
                    <ValidatedInput
                      id="customOSVersion"
                      label="Operating System Details"
                      type="text"
                      value={formData.customOSVersion}
                      onChange={(value) => handleInputChange('customOSVersion', value)}
                      validation={fieldValidations.customOSVersion}
                      placeholder="Enter OS name and version (e.g., FreeBSD 13.2)"
                      required
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {/* IP Address Input */}
                  <ValidatedInput
                    id="ipAddress"
                    label="IP Address"
                    type="text"
                    value={formData.ipAddress}
                    onChange={(value) => handleInputChange('ipAddress', value)}
                    validation={fieldValidations.ipAddress}
                    placeholder="Enter IP address (e.g., 192.168.1.100)"
                    required
                  />

                  {/* MAC Address Input */}
                  <ValidatedInput
                    id="macAddress"
                    label="MAC Address"
                    type="text"
                    value={formData.macAddress}
                    onChange={(value) => handleInputChange('macAddress', value)}
                    validation={fieldValidations.macAddress}
                    placeholder="Enter MAC address (e.g., 00:11:22:33:44:55)"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-8 border-t border-white/20">
                <div className="space-y-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 text-lg font-bold rounded-xl transition-all duration-300 ${
                      isSubmitting
                        ? 'bg-gray-600/50 cursor-not-allowed opacity-50 border border-gray-500/30'
                        : 'bg-gradient-to-r from-purple-600/90 to-blue-600/90 hover:from-purple-700 hover:to-blue-700 text-white backdrop-blur-sm border border-white/30 hover:border-white/50 hover:shadow-2xl hover:scale-[1.02] shadow-lg'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6 mr-3" />
                        Submit Access Request
                      </>
                    )}
                  </Button>

                </div>
              </div>

              {/* Back to Home Link */}
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="text-sm text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  ← Back to Home
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

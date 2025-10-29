"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AdminSidebar from "./AdminSidebar";
import BasicDetails from "./BasicDetails";
import AdminDetails from "./AdminDetails";
import SecurityPreferences from "./SecurityPreferences";
import InitialSecuritySetup from "./InitialSecuritySetup";
import AgreementsSetup from "./AgreementsSetup";
import ReviewSubmit from "./ReviewSubmit";
import { Button } from "@/components/ui/button";
import { FieldValidation } from "@/utils/validation";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { EnhancedStepIndicator, ADMIN_SETUP_STEPS } from "./EnhancedStepIndicator";
import { API_URLS, apiRequest } from "@/utils/api";
import { CompactLogoutButton } from "@/components/ui/logout-button";

type NotificationPreferences = {
  email: boolean;
  sms: boolean;
  push: boolean;
};

type FormData = {
  // Basic Details
  companyName: string;
  email: string;
  username?: string;
  companySize: string;
  industry: string;
  otherIndustryText?: string;
  website?: string;
  address?: string;
  ceoName?: string;
  companyRegistration?: string;
  country?: string;
  timezone?: string;
  contactNumber?: string;

  // Admin Personal Details
  fullName: string;
  role: string;
  phoneNumber?: string;
  backupEmail?: string;
  ip_address?: string;

  // Security Preferences
  alertSensitivity: "Low" | "Medium" | "High";
  mfaEnabled: boolean;
  notificationPreference: NotificationPreferences;
  endpointApprovalMode: "Auto-approve" | "Manual Approval";
  virusTotalApiKey?: string;

  // Initial Security Setup
  endpointLimit: number;
  threatResponseMode: "Passive" | "Active" | "Manual";
  deviceVerificationMethod: "IP Matching" | "Code Verification" | "Manual Review";

  // Agreements and Setup
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
  securityContactEmail: string;
};

const MAX_STEPS = 6;

export default function AdminSetupForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepValidation, setStepValidation] = useState<{ [key: number]: boolean }>({});
  const [stepErrors, setStepErrors] = useState<{ [key: number]: any }>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.get('edit') === 'true';

    if (!storedUserId) {
      // No user logged in, redirect to login
      router.push("/login");
      return;
    }

    setLoggedInUserId(storedUserId);
    setIsEditMode(editMode);

    // Load admin user data from localStorage immediately
    const adminUserData = localStorage.getItem('adminUser');
    if (adminUserData) {
      const adminUser = JSON.parse(adminUserData);
      console.log('AdminUser data from localStorage:', adminUser);

      // Get username from adminUser data
      const username = adminUser.username || adminUser.email || '';
      const companyName = adminUser.organization_name || adminUser.company_name || '';

      console.log('Setting username:', username, 'companyName:', companyName);

      setFormData(prev => ({
        ...prev,
        companyName: companyName,
        email: username, // Use email field to store username for display
        username: username // Store username for reference
      }));
    }

    loadUserData(storedUserId, editMode);
  }, [router]);

  const loadUserData = async (userId: string, editMode: boolean = false) => {
    try {
      // Also check localStorage for admin user data
      const adminUserData = localStorage.getItem('adminUser');
      console.log('Admin user data from localStorage:', adminUserData);

      if (adminUserData) {
        const adminUser = JSON.parse(adminUserData);
        console.log('Parsed admin user:', adminUser);

        // Get the actual email, not username
        const actualEmail = adminUser.email_address || adminUser.email || '';
        // Only use email if it contains @ symbol, otherwise leave empty
        const validEmail = actualEmail && actualEmail.includes('@') ? actualEmail : '';

        // Set data from localStorage if available
        setFormData(prev => ({
          ...prev,
          companyName: adminUser.organization_name || adminUser.company_name || '',
          email: validEmail
        }));
      }

      // Load user's basic info from users table
      console.log('Loading user data for userId:', userId);

      // Try to get user data by ID first
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('*') // Select all columns to see what's available
        .eq('id', userId)
        .single();

      // If no data found by ID, try to find by username (in case the adminUser contains username)
      if (!userData && adminUserData) {
        const adminUser = JSON.parse(adminUserData);
        const username = adminUser.email || adminUser.username || '';

        if (username && !username.includes('@')) {
          console.log('Trying to find user by username:', username);
          const { data: userByUsername, error: usernameError } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

          if (userByUsername && !usernameError) {
            userData = userByUsername;
            userError = usernameError;
          }
        }
      }

      console.log('User data from users table (all columns):', userData);
      console.log('User data error:', userError);

      if (userData && !userError) {
        // Try different possible column names for company and username
        const companyName = userData.company_name || userData.organization_name || userData.organization || '';
        const username = userData.username || userData.email || '';

        console.log('Setting form data with companyName:', companyName, 'username:', username);
        setFormData(prev => ({
          ...prev,
          companyName: companyName || prev.companyName, // Keep localStorage data if DB data is empty
          email: username || prev.email, // Use email field to store username
          username: username || prev.username
        }));
      } else {
        console.error('Failed to load user data:', userError);
      }

      // If in edit mode, load existing profile data
      if (editMode) {
        try {
          const response = await apiRequest(API_URLS.ADMIN_PROFILE(userId));
          if (response.ok) {
            const profileData = await response.json();
            if (profileData) {
              setFormData(prev => ({
                ...prev,
                companySize: profileData.company_size || '',
                industry: profileData.industry || '',
                otherIndustryText: profileData.other_industry_text || '',
                website: profileData.website || '',
                address: profileData.address || '',
                ceoName: profileData.ceo_name || '',
                country: profileData.country || '',
                timezone: profileData.timezone || '',
                contactNumber: profileData.contact_number || '',
                fullName: profileData.full_name || '',
                role: profileData.role || '',
                phoneNumber: profileData.admin_phone_number || '',
                backupEmail: profileData.backup_email || '',
                ip_address: profileData.ip_address || '',
                alertSensitivity: profileData.alert_sensitivity || 'Medium',
                mfaEnabled: profileData.mfa_enabled || false,
                notificationPreference: {
                  email: profileData.notify_email || false,
                  sms: profileData.notify_sms || false,
                  push: profileData.notify_push || false
                },
                endpointApprovalMode: profileData.endpoint_approval_mode || 'Manual Approval',
                virusTotalApiKey: profileData.virustotal_api_key || '',
                endpointLimit: profileData.endpoint_limit || 10,
                threatResponseMode: profileData.threat_response_mode || 'Passive',
                deviceVerificationMethod: profileData.device_verification_method || 'Manual Review',
                acceptedTerms: profileData.accepted_terms || false,
                acceptedPrivacyPolicy: profileData.accepted_privacy_policy || false,
                securityContactEmail: profileData.security_contact_email || ''
              }));
            }
          }
        } catch (profileError) {
          // Continue with basic data if profile loading fails
        }
      }
    } catch (error) {
      // Error loading user data - continue with empty form
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    email: "",
    companySize: "",
    industry: "",
    otherIndustryText: "",
    website: "",
    address: "",
    ceoName: "",
    companyRegistration: "",
    country: "",
    timezone: "",
    contactNumber: "",

    fullName: "",
    role: "",
    phoneNumber: "",
    backupEmail: "",
    ip_address: "",

    alertSensitivity: "Medium",
    mfaEnabled: false,
    notificationPreference: { email: false, sms: false, push: false },
    endpointApprovalMode: "Manual Approval",
    virusTotalApiKey: "",

    endpointLimit: 10,
    threatResponseMode: "Passive",
    deviceVerificationMethod: "Manual Review",

    acceptedTerms: false,
    acceptedPrivacyPolicy: false,
    securityContactEmail: "",
  });

  const updateForm = (fields: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  // Validation handlers for each step
  const handleStepValidation = React.useCallback((stepNum: number, isValid: boolean, errors: FieldValidation) => {
    setStepValidation(prev => {
      if (prev[stepNum] === isValid) return prev; // Prevent unnecessary updates
      return { ...prev, [stepNum]: isValid };
    });
    setStepErrors(prev => ({ ...prev, [stepNum]: errors }));
  }, []);

  const canGoNext = () => {
    // Check if current step is valid based on validation state
    const currentStepValid = stepValidation[step] !== false;

    // Fallback to basic validation for steps without validation components
    switch (step) {
      case 1:
        return currentStepValid && (
          formData.companySize.trim() !== "" &&
          formData.industry.trim() !== "" &&
          (formData.industry !== "Others" || (formData.otherIndustryText?.trim() || "") !== "")
        );
      case 2:
        return currentStepValid && formData.fullName.trim() !== "" && formData.role.trim() !== "" && formData.ip_address && formData.ip_address.trim() !== "";
      case 3:
        return true; // Security preferences - no required fields
      case 4:
        return currentStepValid && (
          formData.endpointLimit > 0 &&
          formData.threatResponseMode.trim() !== "" &&
          formData.deviceVerificationMethod.trim() !== ""
        );
      case 5:
        return currentStepValid && (
          formData.acceptedTerms &&
          formData.acceptedPrivacyPolicy &&
          formData.securityContactEmail.trim() !== ""
        );
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (step < MAX_STEPS && canGoNext()) {
      setIsTransitioning(true);
      await new Promise(resolve => setTimeout(resolve, 150)); // Smooth transition
      setStep(s => s + 1);
      setIsTransitioning(false);
    }
  };

  const handleBack = async () => {
    if (step > 1) {
      setIsTransitioning(true);
      await new Promise(resolve => setTimeout(resolve, 150)); // Smooth transition
      setStep(s => s - 1);
      setIsTransitioning(false);
    }
  };

  const handleSetupSuccess = async () => {
    // Add a small delay to ensure database transaction is complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Force a page reload to ensure fresh state when redirecting to dashboard
    window.location.href = "/admin/dashboard";
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-black/80">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-purple-500 rounded-full animate-spin border-t-transparent"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative z-10 min-h-screen">
        {/* Header with Logout */}
        <div className="absolute z-20 top-4 right-4">
          <CompactLogoutButton />
        </div>

        {/* Enhanced Step Indicator */}
        <div className="pt-8 pb-4">
          <EnhancedStepIndicator
            currentStep={step}
            totalSteps={MAX_STEPS}
            stepTitles={ADMIN_SETUP_STEPS}
            isEditMode={isEditMode}
          />
        </div>

        {/* Form Container */}
        <div className="max-w-6xl px-6 mx-auto">
          <div className="overflow-hidden border shadow-2xl bg-white/10 backdrop-blur-md border-white/20 rounded-2xl">
            {/* Form Content */}
            <div className={`p-8 transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        {step === 1 && (
          <BasicDetails
            formData={formData}
            updateForm={updateForm}
            onValidationChange={(isValid, errors) => handleStepValidation(1, isValid, errors)}
          />
        )}
        {step === 2 && (
          <AdminDetails
            formData={formData}
            updateForm={updateForm}
            onValidationChange={(isValid, errors) => handleStepValidation(2, isValid, errors)}
          />
        )}
        {step === 3 && <SecurityPreferences formData={formData} updateForm={updateForm} />}
        {step === 4 && (
          <InitialSecuritySetup
            formData={formData}
            updateForm={updateForm}
            onValidationChange={(isValid, errors) => handleStepValidation(4, isValid, errors)}
          />
        )}
        {step === 5 && (
          <AgreementsSetup
            formData={formData}
            updateForm={updateForm}
            onValidationChange={(isValid, errors) => handleStepValidation(5, isValid, errors)}
          />
        )}
        {step === 6 && <ReviewSubmit formData={formData} userId={loggedInUserId} onSubmitSuccess={handleSetupSuccess} />}

            {/* Enhanced Navigation */}
            <div className="flex items-center justify-between pt-8 mt-12 border-t border-gray-700/50">
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isTransitioning}
                  className="flex items-center gap-2 px-6 py-3 text-gray-300 transition-all duration-200 border-gray-600 bg-gray-700/50 hover:bg-gray-600/50 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < MAX_STEPS && (
                <div className="flex flex-col items-end space-y-3">
                  <Button
                    onClick={handleNext}
                    disabled={!canGoNext() || isTransitioning}
                    className={`flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 ${
                      !canGoNext() || isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    {isTransitioning ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                  {!canGoNext() && !isTransitioning && (
                    <div className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-red-500/10 border-red-500/20">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <p className="text-sm text-red-300">Please complete all required fields</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

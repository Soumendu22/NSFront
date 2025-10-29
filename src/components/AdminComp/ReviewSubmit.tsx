"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, User, Shield, Settings, FileCheck, Mail } from "lucide-react";
import { API_URLS, apiRequest } from "@/utils/api";

type NotificationPreferences = {
  email: boolean;
  sms: boolean;
  push: boolean;
};

type FormData = {
  // Basic Details
  companyName: string;
  email: string;
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

type Props = {
  formData: FormData;
  userId: string | null;
  onSubmitSuccess?: () => void;
};

export default function ReviewSubmit({ formData, userId, onSubmitSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!userId) {
      setError("User ID missing. Please log in again.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiRequest(API_URLS.ADMIN_SETUP, {
        method: "POST",
        body: JSON.stringify({
          id: userId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Submission failed");

      setSuccess("Setup completed successfully! Redirecting to dashboard...");
      // Wait a moment then call the success callback to trigger state update
      setTimeout(() => {
        if (onSubmitSuccess) {
          onSubmitSuccess();
        } else {
          // Fallback: reload if no callback provided
          window.location.reload();
        }
      }, 1500);
    } catch (e: any) {
      setError(e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderNotificationPreferences = () => {
    const { notificationPreference } = formData;
    const activePrefs = [];
    if (notificationPreference.email) activePrefs.push("Email");
    if (notificationPreference.sms) activePrefs.push("SMS");
    if (notificationPreference.push) activePrefs.push("Push");
    return activePrefs.length > 0 ? activePrefs.join(", ") : "None";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="mb-8 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-white">
        Review Your Setup
      </h2>
      
      <p className="mb-8 text-gray-400">
        Please review all the information below before submitting your admin setup.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Information */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Building2 className="w-5 h-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-gray-400 text-sm">Company Name:</span>
              <p className="text-white">{formData.companyName}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Email:</span>
              <p className="text-white">{formData.email}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Company Size:</span>
              <p className="text-white">{formData.companySize}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Industry:</span>
              <p className="text-white">
                {formData.industry === "Others" ? formData.otherIndustryText : formData.industry}
              </p>
            </div>
            {formData.website && (
              <div>
                <span className="text-gray-400 text-sm">Website:</span>
                <p className="text-white">{formData.website}</p>
              </div>
            )}
            {formData.address && (
              <div>
                <span className="text-gray-400 text-sm">Address:</span>
                <p className="text-white">{formData.address}</p>
              </div>
            )}
            {formData.ceoName && (
              <div>
                <span className="text-gray-400 text-sm">CEO Name:</span>
                <p className="text-white">{formData.ceoName}</p>
              </div>
            )}
            {formData.country && (
              <div>
                <span className="text-gray-400 text-sm">Country:</span>
                <p className="text-white">{formData.country}</p>
              </div>
            )}
            {formData.timezone && (
              <div>
                <span className="text-gray-400 text-sm">Timezone:</span>
                <p className="text-white">{formData.timezone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Details */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <User className="w-5 h-5" />
              Administrator Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-gray-400 text-sm">Full Name:</span>
              <p className="text-white">{formData.fullName}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Role:</span>
              <p className="text-white">{formData.role}</p>
            </div>
            {formData.phoneNumber && (
              <div>
                <span className="text-gray-400 text-sm">Phone Number:</span>
                <p className="text-white">{formData.phoneNumber}</p>
              </div>
            )}
            {formData.backupEmail && (
              <div>
                <span className="text-gray-400 text-sm">Backup Email:</span>
                <p className="text-white">{formData.backupEmail}</p>
              </div>
            )}
            {formData.contactNumber && (
              <div>
                <span className="text-gray-400 text-sm">Contact Number:</span>
                <p className="text-white">{formData.contactNumber}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Preferences */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Shield className="w-5 h-5" />
              Security Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-gray-400 text-sm">Alert Sensitivity:</span>
              <p className="text-white">{formData.alertSensitivity}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Multi-Factor Authentication:</span>
              <p className="text-white">{formData.mfaEnabled ? "Enabled" : "Disabled"}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Notification Preferences:</span>
              <p className="text-white">{renderNotificationPreferences()}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Endpoint Approval Mode:</span>
              <p className="text-white">{formData.endpointApprovalMode}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">VirusTotal API Key:</span>
              <p className="text-white">
                {formData.virusTotalApiKey ? 
                  `${formData.virusTotalApiKey.substring(0, 8)}${'*'.repeat(Math.max(0, formData.virusTotalApiKey.length - 8))}` : 
                  'Not configured'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Setup */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Settings className="w-5 h-5" />
              Security Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-gray-400 text-sm">Endpoint Limit:</span>
              <p className="text-white">{formData.endpointLimit}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Threat Response Mode:</span>
              <p className="text-white">{formData.threatResponseMode}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Device Verification Method:</span>
              <p className="text-white">{formData.deviceVerificationMethod}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agreements Section */}
      <Card className="mt-6 bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <FileCheck className="w-5 h-5" />
            Agreements & Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-gray-400 text-sm">Terms & Conditions:</span>
            <p className="text-white">{formData.acceptedTerms ? "✓ Accepted" : "✗ Not Accepted"}</p>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Privacy Policy:</span>
            <p className="text-white">{formData.acceptedPrivacyPolicy ? "✓ Accepted" : "✗ Not Accepted"}</p>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Security Contact Email:</span>
            <p className="text-white">{formData.securityContactEmail}</p>
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {error && (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-500 rounded-md">
          <p className="text-red-300">❌ {error}</p>
        </div>
      )}
      
      {success && (
        <div className="mt-6 p-4 bg-green-900/50 border border-green-500 rounded-md">
          <p className="text-green-300">✅ {success}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end mt-8">
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !userId}
          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white px-8 py-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            "Complete Setup"
          )}
        </Button>
      </div>
    </div>
  );
}

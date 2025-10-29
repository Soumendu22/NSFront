"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Props = {
  formData: any;
  updateForm: (fields: Partial<any>) => void;
};

export default function SecurityPreferences({ formData, updateForm }: Props) {
  return (
    <div>
      <h2 className="mb-8 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-white">
        Security Preferences
      </h2>

      <form className="max-w-3xl space-y-8">

        {/* Default Alert Sensitivity Level (Radio/Select) */}
        <div>
          <Label className="block mb-2 font-medium text-gray-300">
            Default Alert Sensitivity Level
          </Label>
          <RadioGroup
            value={formData.alertSensitivity}
            onValueChange={(val) => updateForm({ alertSensitivity: val })}
            className="flex space-x-6"
          >
            {["Low", "Medium", "High"].map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <RadioGroupItem value={level} id={`sensitivity-${level}`} />
                <Label htmlFor={`sensitivity-${level}`} className="text-gray-300 cursor-pointer">
                  {level}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Multi-Factor Auth (MFA) Toggle */}
        <div className="flex items-center space-x-4">
          <Switch
            checked={formData.mfaEnabled}
            onCheckedChange={(val) => updateForm({ mfaEnabled: val })}
            id="mfaToggle"
          />
          <Label htmlFor="mfaToggle" className="font-medium text-gray-300 cursor-pointer">
            Force MFA on login
          </Label>
        </div>

        {/* Notification Preference (Checkboxes) */}
        <div>
          <Label className="block mb-2 font-medium text-gray-300">
            Notification Preferences
          </Label>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notifyEmail"
                checked={formData.notificationPreference.email}
                onCheckedChange={(val) =>
                  updateForm({
                    notificationPreference: {
                      ...formData.notificationPreference,
                      email: val ?? false,
                    },
                  })
                }
              />
              <Label htmlFor="notifyEmail" className="text-gray-300 cursor-pointer">
                Email
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notifySMS"
                checked={formData.notificationPreference.sms}
                onCheckedChange={(val) =>
                  updateForm({
                    notificationPreference: {
                      ...formData.notificationPreference,
                      sms: val ?? false,
                    },
                  })
                }
              />
              <Label htmlFor="notifySMS" className="text-gray-300 cursor-pointer">
                SMS
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notifyPush"
                checked={formData.notificationPreference.push}
                onCheckedChange={(val) =>
                  updateForm({
                    notificationPreference: {
                      ...formData.notificationPreference,
                      push: val ?? false,
                    },
                  })
                }
              />
              <Label htmlFor="notifyPush" className="text-gray-300 cursor-pointer">
                Mobile App Push
              </Label>
            </div>
          </div>
        </div>

        {/* Endpoint Approval Mode (Select) */}
        <div>
          <Label htmlFor="endpointApprovalMode" className="block mb-1 font-medium text-gray-300">
            Endpoint Approval Mode
          </Label>
          <Select
            value={formData.endpointApprovalMode}
            onValueChange={(val) => updateForm({ endpointApprovalMode: val })}
          >
            <SelectTrigger id="endpointApprovalMode" className="w-full">
              <SelectValue placeholder="Select approval mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Auto-approve">Auto-approve</SelectItem>
              <SelectItem value="Manual Approval">Manual Approval</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* VirusTotal API Key */}
        <div>
          <Label htmlFor="virusTotalApiKey" className="block mb-2 font-medium text-gray-300">
            VirusTotal API Key
          </Label>
          <input
            id="virusTotalApiKey"
            type="text"
            placeholder="Enter your VirusTotal API key (optional)"
            value={formData.virusTotalApiKey || ''}
            onChange={(e) => updateForm({ virusTotalApiKey: e.target.value })}
            className="w-full p-3 text-gray-100 placeholder-gray-400 transition-colors border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <p className="mt-1 text-sm text-gray-400">
            Used for enhanced file scanning and threat detection. You can get your API key from{' '}
            <a 
              href="https://www.virustotal.com/gui/my-apikey" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-purple-400 underline hover:text-purple-300"
            >
              VirusTotal
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

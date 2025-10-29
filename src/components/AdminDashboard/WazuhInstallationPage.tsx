'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { NotificationContainer, useNotifications } from '@/components/ui/notification';
import SecurePasswordModal from './SecurePasswordModal';
import {
  Shield,
  Terminal,
  Copy,
  CheckCircle,
  Eye,
  EyeOff,
  Server,
  Lock,
  ArrowRight,
  ExternalLink,
  BookOpen,
  KeyRound
} from 'lucide-react';
import { API_URLS, apiRequest } from '@/utils/api';
import { FieldValidation } from '@/utils/validation';

interface WazuhInstallationPageProps {
  adminUserId: string;
}

interface WazuhCredentials {
  wazuh_username: string;
  wazuh_password: string;
}

const WazuhInstallationPage: React.FC<WazuhInstallationPageProps> = ({ adminUserId }) => {
  const { notifications, addNotification, removeNotification } = useNotifications();
  const [currentStep, setCurrentStep] = useState<'installation' | 'credentials' | 'complete'>('installation');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingCredentials, setHasExistingCredentials] = useState(false);
  const [existingUsername, setExistingUsername] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [credentials, setCredentials] = useState<WazuhCredentials>({
    wazuh_username: '',
    wazuh_password: ''
  });

  const [validation, setValidation] = useState({
    isValid: false,
    errors: {
      wazuh_username: 'Username is required',
      wazuh_password: 'Password is required'
    }
  });

  // System requirements data
  const systemRequirements = [
    { agents: "1-25", cpu: "4 vCPU", ram: "8 GiB", storage: "50 GB" },
    { agents: "25-50", cpu: "8 vCPU", ram: "8 GiB", storage: "100 GB" },
    { agents: "50-100", cpu: "8 vCPU", ram: "8 GiB", storage: "200 GB" }
  ];

  // Installation commands from Wazuh documentation
  const installationCommands = [
    {
      title: "1. Download and run the Wazuh installation assistant",
      command: "curl -sO https://packages.wazuh.com/4.13/wazuh-install.sh && sudo bash ./wazuh-install.sh -a",
      description: "This will install Wazuh manager, indexer, and dashboard"
    },
    {
      title: "2. Access the Wazuh web interface",
      command: "https://<wazuh-dashboard-ip>",
      description: "Replace <wazuh-dashboard-ip> with your server's IP address"
    },
    {
      title: "3. Extract the admin credentials",
      command: "sudo tar -O -xvf wazuh-install-files.tar wazuh-install-files/wazuh-passwords.txt",
      description: "This will show the admin username and password for the web interface"
    },
    {
      title: "4. Disable Wazuh package repositories (Recommended)",
      command: "sed -i \"s/^deb/#deb/\" /etc/apt/sources.list.d/wazuh.list\napt update",
      description: "Disable Wazuh updates to prevent accidental upgrades that could break the environment"
    },
    {
      title: "5. Run this custom NexusSentinel-Wazuh manager command (Required)",
      command: "curl -LO raw.githubusercontent.com/Soumendu22/Wazuh_NexusSentinel/master/customwazuhmanager.sh \nsudo chmod +x customwazuhmanager.sh \n./customwazuhmanager.sh",
      description: "Adds custom changes to the wazuh manager"
    }
  ];

  // Check for existing credentials on component mount
  useEffect(() => {
    checkExistingCredentials();
  }, [adminUserId]);

  // Validate credentials whenever they change
  useEffect(() => {
    validateCredentials();
  }, [credentials, hasExistingCredentials]);

  const checkExistingCredentials = async () => {
    try {
      console.log('Checking existing credentials for user:', adminUserId);

      if (!adminUserId) {
        console.error('No adminUserId provided');
        return;
      }

      const url = API_URLS.WAZUH_CREDENTIALS_CHECK(adminUserId);
      console.log('Making request to:', url);

      const response = await apiRequest(url);
      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Credentials check response:', data);

        setHasExistingCredentials(data.hasCredentials);
        setExistingUsername(data.wazuh_username);

        if (data.hasCredentials) {
          setCurrentStep('complete');
          // Pre-fill the username for display/update purposes
          setCredentials(prev => ({
            ...prev,
            wazuh_username: data.wazuh_username || ''
          }));
        }
      } else {
        // If there's an error, just assume no credentials exist
        console.log('Error checking credentials, assuming no credentials exist');
        setHasExistingCredentials(false);
        setExistingUsername(null);
      }
    } catch (error) {
      // If there's an error, just assume no credentials exist
      console.log('Error checking credentials, assuming no credentials exist:', error);
      setHasExistingCredentials(false);
      setExistingUsername(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addNotification('success', 'Success', 'Command copied to clipboard!', { duration: 2000 });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      addNotification('error', 'Error', 'Failed to copy to clipboard', { duration: 3000 });
    }
  };

  const validateCredentials = () => {
    const errors = {
      wazuh_username: '',
      wazuh_password: ''
    };

    console.log('Validating credentials:', {
      username: credentials.wazuh_username,
      password: credentials.wazuh_password ? '[HIDDEN]' : 'EMPTY',
      hasExistingCredentials
    });

    // Validate username
    if (!credentials.wazuh_username.trim()) {
      errors.wazuh_username = 'Username is required';
    } else if (credentials.wazuh_username.trim().length < 3) {
      errors.wazuh_username = 'Username must be at least 3 characters';
    }

    // Validate password (allow empty when updating existing credentials)
    if (!credentials.wazuh_password.trim()) {
      if (!hasExistingCredentials) {
        errors.wazuh_password = 'Password is required';
      }
      // If updating existing credentials, empty password means keep current password
    } else if (credentials.wazuh_password.trim().length < 6) {
      errors.wazuh_password = 'Password must be at least 6 characters';
    }

    const isValid = !errors.wazuh_username && !errors.wazuh_password;

    console.log('Validation result:', {
      isValid,
      errors,
      usernameError: errors.wazuh_username,
      passwordError: errors.wazuh_password
    });

    setValidation({
      isValid,
      errors
    });

    return isValid;
  };

  const handleCredentialChange = (field: keyof WazuhCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));

    // Trigger validation after state update
    setTimeout(() => {
      validateCredentials();
    }, 0);
  };

  const handleSubmitCredentials = async () => {
    if (!validateCredentials()) {
      addNotification('error', 'Validation Error', 'Please fix the validation errors before submitting', { duration: 4000 });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Submitting credentials for user:', adminUserId);
      console.log('Credentials data:', {
        userId: adminUserId,
        wazuh_username: credentials.wazuh_username,
        wazuh_password: credentials.wazuh_password ? '[HIDDEN]' : 'EMPTY'
      });

      const response = await apiRequest(API_URLS.WAZUH_CREDENTIALS, {
        method: 'POST',
        body: JSON.stringify({
          userId: adminUserId,
          wazuh_username: credentials.wazuh_username.trim(),
          wazuh_password: credentials.wazuh_password.trim()
        })
      });

      console.log('Save credentials response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Save credentials success:', responseData);

        addNotification('success', 'Success', 'Wazuh credentials saved successfully!', { duration: 4000 });
        setCurrentStep('complete');
        setHasExistingCredentials(true);
        setExistingUsername(credentials.wazuh_username);

        // Clear the password field for security
        setCredentials(prev => ({
          ...prev,
          wazuh_password: ''
        }));
      } else {
        const errorText = await response.text();
        console.error('Save credentials error response:', response.status, errorText);
        addNotification('error', 'Save Error', `Failed to save credentials: ${response.status} - ${errorText}`, { duration: 8000 });
      }
    } catch (error) {
      console.error('Error saving Wazuh credentials:', error);
      addNotification('error', 'Network Error', 'Failed to save credentials. Please check your connection and try again.', { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const renderInstallationGuide = () => (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">Wazuh SIEM/EDR Installation</h2>
        <p className="max-w-2xl mx-auto text-gray-300">
          Follow these steps to install Wazuh manager on your Linux server. This will provide
          comprehensive security monitoring and threat detection for your infrastructure.
        </p>
      </div>

      {/* System Requirements */}
      <Card className="mb-6 bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Server className="w-5 h-5" />
            System Requirements
          </CardTitle>
          <CardDescription className="text-gray-300">
            Minimum hardware requirements based on the number of agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-600/20">
                  <th className="px-4 py-3 font-medium text-left text-white border border-white/20">Agents</th>
                  <th className="px-4 py-3 font-medium text-left text-white border border-white/20">CPU</th>
                  <th className="px-4 py-3 font-medium text-left text-white border border-white/20">RAM</th>
                  <th className="px-4 py-3 font-medium text-left text-white border border-white/20">Storage (90 days)</th>
                </tr>
              </thead>
              <tbody>
                {systemRequirements.map((req, index) => (
                  <tr key={index} className="bg-gray-800/50">
                    <td className="px-4 py-3 text-white border border-white/20">{req.agents}</td>
                    <td className="px-4 py-3 text-white border border-white/20">{req.cpu}</td>
                    <td className="px-4 py-3 text-white border border-white/20">{req.ram}</td>
                    <td className="px-4 py-3 text-white border border-white/20">{req.storage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <ExternalLink className="w-5 h-5" />
            Official Documentation
          </CardTitle>
          <CardDescription className="text-gray-300">
            For detailed installation instructions, visit the official Wazuh documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a 
            href="https://documentation.wazuh.com/current/quickstart.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            https://documentation.wazuh.com/current/quickstart.html
          </a>
        </CardContent>
      </Card>

      {installationCommands.map((cmd, index) => (
        <Card key={index} className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg">{cmd.title}</CardTitle>
            <CardDescription>{cmd.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative p-4 font-mono text-sm text-green-400 bg-gray-900 rounded-lg">
              <pre className="break-all whitespace-pre-wrap">{cmd.command}</pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute text-gray-400 top-2 right-2 hover:text-white"
                onClick={() => copyToClipboard(cmd.command)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="p-4 border border-purple-200 rounded-lg bg-white/10">
        <div className="flex items-start">
          <Terminal className="h-5 w-5 text-white mt-0.5 mr-3" />
          <div>
            <h4 className="font-medium text-purple-800">Important Notes:</h4>
            <ul className="mt-2 space-y-1 text-sm text-white">
              <li>• Ensure your Linux server meets the minimum system requirements</li>
              <li>• Run these commands with sudo privileges</li>
              <li>• Make note of the admin credentials generated during installation</li>
              <li>• Configure firewall rules to allow access to the Wazuh dashboard</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <Button
          onClick={() => setCurrentStep('credentials')}
          className="px-8 py-2 text-white bg-blue-600 hover:bg-blue-700"
        >
          {hasExistingCredentials ? 'Back to Credentials' : 'Installation Complete - Continue'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderCredentialsForm = () => (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <Lock className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">
          {hasExistingCredentials ? 'Update Wazuh Credentials' : 'Wazuh Manager Credentials'}
        </h2>
        <p className="max-w-2xl mx-auto text-gray-300">
          {hasExistingCredentials
            ? 'Update your existing Wazuh manager credentials. The username is pre-filled, enter a new password to update it.'
            : 'Enter the admin credentials for your Wazuh manager. These will be securely stored and used for SIEM/EDR integration with your endpoint monitoring system.'
          }
        </p>
      </div>

      <Card className="max-w-md mx-auto bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Server className="w-5 h-5" />
            Wazuh Manager Access
          </CardTitle>
          <CardDescription className="text-gray-300">
            Enter the admin credentials from your Wazuh installation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="wazuh_username" className="text-white">Username</Label>
            <Input
              id="wazuh_username"
              type="text"
              placeholder="admin"
              value={credentials.wazuh_username}
              onChange={(e) => handleCredentialChange('wazuh_username', e.target.value)}
              className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 ${
                validation.errors.wazuh_username ? 'border-red-500' : ''
              }`}
            />
            {validation.errors.wazuh_username && (
              <p className="mt-1 text-sm text-red-400">{validation.errors.wazuh_username}</p>
            )}
          </div>

          <div>
            <Label htmlFor="wazuh_password" className="text-white">Password</Label>
            <div className="relative">
              <Input
                id="wazuh_password"
                type={showPassword ? "text" : "password"}
                placeholder={hasExistingCredentials ? "Enter new password (leave empty to keep current)" : "Enter Wazuh admin password"}
                value={credentials.wazuh_password}
                onChange={(e) => handleCredentialChange('wazuh_password', e.target.value)}
                className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10 ${
                  validation.errors.wazuh_password ? 'border-red-500' : ''
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute w-8 h-8 p-0 text-gray-400 transform -translate-y-1/2 right-2 top-1/2 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
            {validation.errors.wazuh_password && (
              <p className="mt-1 text-sm text-red-400">{validation.errors.wazuh_password}</p>
            )}
          </div>

          <div className="p-3 border rounded-lg border-blue-500/30 bg-blue-500/10">
            <p className="text-sm text-blue-300">
              <strong>Security Note:</strong> Your credentials will be encrypted and stored securely.
              They will only be used for authorized SIEM/EDR integration purposes.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep('installation')}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmitCredentials}
              disabled={!validation.isValid || isLoading}
              className="flex-1 text-white bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                  {hasExistingCredentials ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  {hasExistingCredentials ? 'Update Credentials' : 'Save Credentials'}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">Wazuh Integration Complete!</h2>
        <p className="max-w-2xl mx-auto text-gray-300">
          Your Wazuh SIEM/EDR integration has been successfully configured.
          The system is now ready to provide enhanced security monitoring for your endpoints.
        </p>
      </div>

      <Card className="max-w-md mx-auto bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Shield className="w-5 h-5" />
            Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg bg-green-500/20 border-green-500/30">
            <span className="text-sm font-medium text-green-300">Wazuh Manager</span>
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg bg-green-500/20 border-green-500/30">
            <span className="text-sm font-medium text-green-300">Credentials Stored</span>
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>

          {existingUsername && (
            <div className="p-3 border rounded-lg bg-white/5 border-white/10">
              <p className="text-sm text-gray-300">
                <strong className="text-white">Configured Username:</strong> {existingUsername}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Password is securely encrypted and stored
              </p>
            </div>
          )}

          <div className="p-3 border rounded-lg bg-blue-500/10 border-blue-500/30">
            <p className="text-sm text-blue-300">
              <strong>Next Steps:</strong> Your endpoints will now automatically integrate with
              Wazuh for enhanced security monitoring and threat detection.
            </p>
          </div>

          <div className="space-y-3">
            {/* Primary Actions */}
            <div className="flex gap-3">
              {hasExistingCredentials && (
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordModal(true)}
                  className="flex-1 text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Password
                </Button>
              )}
              {hasExistingCredentials && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep('credentials');
                    // Clear password for security when updating
                    setCredentials(prev => ({
                      ...prev,
                      wazuh_password: ''
                    }));
                  }}
                  className="flex-1 text-white border-white/20 hover:bg-white/10"
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Update Credentials
                </Button>
              )}
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => setCurrentStep('installation')}
                variant="outline"
                className="flex-1 text-gray-400 border-gray-500/30 hover:bg-gray-500/10"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                View Installation Guide
              </Button>
              <Button
                onClick={() => {
                  // Refresh credentials check
                  checkExistingCredentials();
                }}
                variant="outline"
                className="flex-1 text-green-400 border-green-500/30 hover:bg-green-500/10"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-black">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${currentStep === 'installation' ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'installation' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Installation</span>
            </div>

            <div className={`w-16 h-0.5 ${currentStep !== 'installation' ? 'bg-green-600' : 'bg-gray-300'}`}></div>

            <div className={`flex items-center ${
              currentStep === 'credentials' ? 'text-blue-600' :
              currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'credentials' ? 'bg-blue-600 text-white' :
                currentStep === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Credentials</span>
            </div>

            <div className={`w-16 h-0.5 ${currentStep === 'complete' ? 'bg-green-600' : 'bg-gray-300'}`}></div>

            <div className={`flex items-center ${currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'installation' && renderInstallationGuide()}
        {currentStep === 'credentials' && renderCredentialsForm()}
        {currentStep === 'complete' && renderCompleteStep()}
      </div>

      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />

      <SecurePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        adminUserId={adminUserId}
        wazuhUsername={existingUsername || ''}
        onNotification={addNotification}
      />
    </div>
  );
};

export default WazuhInstallationPage;

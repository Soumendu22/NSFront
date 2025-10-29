'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { API_URLS, apiRequest } from '@/utils/api';

interface SecurePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUserId: string;
  wazuhUsername: string;
  onNotification: (type: 'success' | 'error', title: string, message: string, options?: { duration?: number }) => void;
}

const SecurePasswordModal: React.FC<SecurePasswordModalProps> = ({
  isOpen,
  onClose,
  adminUserId,
  wazuhUsername,
  onNotification
}) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [wazuhPasswordNote, setWazuhPasswordNote] = useState('');
  const [wazuhPassword, setWazuhPassword] = useState('');
  const [showWazuhPassword, setShowWazuhPassword] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Clear state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAdminPassword('');
      setShowAdminPassword(false);
      setIsVerified(false);
      setWazuhPasswordNote('');
      setWazuhPassword('');
      setShowWazuhPassword(false);
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    }
  }, [isOpen, timeoutId]);

  // Auto-close after 30 seconds of being verified
  useEffect(() => {
    if (isVerified) {
      const id = setTimeout(() => {
        handleClose();
      }, 30000); // 30 seconds
      setTimeoutId(id);
      
      return () => {
        if (id) clearTimeout(id);
      };
    }
  }, [isVerified]);

  const handleClose = () => {
    setAdminPassword('');
    setShowAdminPassword(false);
    setIsVerified(false);
    setWazuhPasswordNote('');
    setWazuhPassword('');
    setShowWazuhPassword(false);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    onClose();
  };

  const handleVerifyPassword = async () => {
    if (!adminPassword.trim()) {
      onNotification('error', 'Validation Error', 'Please enter your admin password', { duration: 3000 });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await apiRequest(API_URLS.WAZUH_PASSWORD_VIEW, {
        method: 'POST',
        body: JSON.stringify({
          userId: adminUserId,
          adminPassword: adminPassword.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsVerified(true);
        setWazuhPasswordNote(data.note || 'Password verification successful');
        setWazuhPassword(data.wazuh_password || '');
        onNotification('success', 'Access Granted', 'Admin password verified successfully', { duration: 4000 });
        
        // Clear the admin password for security
        setAdminPassword('');
        setShowAdminPassword(false);
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          onNotification('error', 'Access Denied', 'Invalid admin password', { duration: 4000 });
        } else {
          onNotification('error', 'Error', errorData.error || 'Failed to verify password', { duration: 4000 });
        }
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      onNotification('error', 'Network Error', 'Failed to verify password. Please try again.', { duration: 4000 });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isVerifying && adminPassword.trim()) {
      handleVerifyPassword();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md bg-black/90 backdrop-blur-sm border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-white">
                {isVerified ? 'Wazuh Credentials Information' : 'Secure Access Required'}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="w-8 h-8 p-0 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription className="text-gray-300">
            {isVerified 
              ? 'Wazuh credentials and security information'
              : 'Enter your admin login password to view Wazuh credentials'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!isVerified ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-white">
                  Admin Login Password
                </Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showAdminPassword ? "text" : "password"}
                    placeholder="Enter your admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-10 text-white bg-white/10 border-white/20 placeholder:text-gray-400"
                    disabled={isVerifying}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute w-8 h-8 p-0 text-gray-400 transform -translate-y-1/2 right-2 top-1/2 hover:text-white"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    disabled={isVerifying}
                  >
                    {showAdminPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-yellow-500/10 border-yellow-500/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-300">
                    This is the same password you use to log into the admin dashboard. 
                    It will be used to verify your identity before showing sensitive information.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 text-white border-white/20 hover:bg-white/10"
                  disabled={isVerifying}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVerifyPassword}
                  disabled={!adminPassword.trim() || isVerifying}
                  className="flex-1 text-white bg-blue-600 hover:bg-blue-700"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Verify Access
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Access Verified</span>
                </div>

                <div className="p-3 border rounded-lg bg-white/5 border-white/10">
                  <Label className="font-medium text-white">Wazuh Username:</Label>
                  <p className="mt-1 font-mono text-gray-300">{wazuhUsername}</p>
                </div>

                <div className="p-3 border rounded-lg bg-white/5 border-white/10">
                  <Label className="font-medium text-white">Wazuh Password:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="flex-1 font-mono text-gray-300">
                      {wazuhPassword ? (showWazuhPassword ? wazuhPassword : '●'.repeat(wazuhPassword.length)) : 'No password found'}
                    </p>
                    {wazuhPassword && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 text-gray-400 hover:text-white"
                        onClick={() => setShowWazuhPassword(!showWazuhPassword)}
                      >
                        {showWazuhPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  {wazuhPassword && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-gray-400 hover:text-white"
                        onClick={() => {
                          navigator.clipboard.writeText(wazuhPassword);
                          onNotification('success', 'Copied', 'Password copied to clipboard', { duration: 2000 });
                        }}
                      >
                        Copy Password
                      </Button>
                    </div>
                  )}
                </div>

                {/* <div className="p-3 border rounded-lg bg-green-500/10 border-green-500/30">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="mb-2 text-sm font-medium text-green-300">Password Retrieved Successfully:</p>
                      <p className="mb-2 text-sm text-green-300">
                        {wazuhPasswordNote}
                      </p>
                      {wazuhPassword && (
                        <p className="text-sm text-green-300">
                          <strong>Security Tips:</strong>
                        </p>
                      )}
                      <ul className="mt-1 ml-4 space-y-1 text-sm text-green-300">
                        <li>• Use the eye icon to toggle password visibility</li>
                        <li>• Click "Copy Password" to copy to clipboard</li>
                        <li>• This window will auto-close for security</li>
                        <li>• Update credentials regularly for best security</li>
                      </ul>
                    </div>
                  </div>
                </div> */}

                <div className="p-3 border rounded-lg bg-blue-500/10 border-blue-500/30">
                  <p className="text-sm text-blue-300">
                    <strong>Security:</strong> This window will automatically close in 30 seconds. 
                    Password is encrypted in database and decrypted only when authorized.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1 text-white border-white/20 hover:bg-white/10"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleClose();
                    // Navigate to credentials update page
                    window.location.href = '/admin/setup?tab=wazuh';
                  }}
                  className="flex-1 text-white bg-purple-600 hover:bg-purple-700"
                >
                  Update Credentials
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurePasswordModal;

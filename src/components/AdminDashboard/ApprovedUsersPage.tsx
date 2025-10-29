'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, RefreshCw, User, Mail, Globe, HardDrive, Loader2, UserX, Search, Send, MailIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationType } from '@/components/ui/notification';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ApprovedUser {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  operating_system: string;
  os_version: string;
  ip_address: string;
  mac_address: string;
  created_at: string;
  approved_at: string;
  organization_id: string;
}

type IntensityLevel = 'high' | 'medium' | 'low';

interface ApprovedUsersPageProps {
  onUpdate: () => void;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ApprovedUsersPage: React.FC<ApprovedUsersPageProps> = ({ onUpdate, addNotification }) => {
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ApprovedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());
  const [sendingEmails, setSendingEmails] = useState<Set<string>>(new Set());
  const [sendingBulkEmail, setSendingBulkEmail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [globalIntensity, setGlobalIntensity] = useState<IntensityLevel>('medium');
  const [individualIntensities, setIndividualIntensities] = useState<Record<string, IntensityLevel>>({});
  const [showIntensitySettings, setShowIntensitySettings] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'warning' | 'danger' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    loadApprovedUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm.trim() === '') {
      setFilteredUsers(approvedUsers);
    } else {
      const filtered = approvedUsers.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.ip_address.includes(searchTerm) ||
        user.operating_system.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, approvedUsers]);

  // Helper function to get current admin's IP
  const getAdminIP = async () => {
    try {
      const adminData = localStorage.getItem('adminUser');
      if (!adminData) {
        console.error('No admin user data found');
        return 'unknown';
      }
      
      const admin = JSON.parse(adminData);
      const adminId = admin.id || admin.user_id;
      
      if (!adminId) {
        console.error('No admin ID found in localStorage');
        return 'unknown';
      }
      
      const response = await fetch(`/api/admin/admin-ip?adminId=${adminId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Admin IP from database:', data.ip);
        return data.ip;
      } else {
        console.error('Failed to fetch admin IP:', response.status);
      }
    } catch (error) {
      console.error('Error getting admin IP:', error);
    }
    return 'unknown';
  };

  // Get effective intensity for a user
  const getEffectiveIntensity = (userId: string): IntensityLevel => {
    return individualIntensities[userId] || globalIntensity;
  };

  // Set intensity for all users
  const setAllUsersIntensity = (intensity: IntensityLevel) => {
    setGlobalIntensity(intensity);
    const newIndividualIntensities: Record<string, IntensityLevel> = {};
    filteredUsers.forEach(user => {
      newIndividualIntensities[user.id] = intensity;
    });
    setIndividualIntensities(newIndividualIntensities);
  };

  // Set intensity for individual user
  const setUserIntensity = (userId: string, intensity: IntensityLevel) => {
    setIndividualIntensities(prev => ({
      ...prev,
      [userId]: intensity
    }));
  };

  const loadApprovedUsers = async () => {
    try {
      setIsLoading(true);
      const adminData = localStorage.getItem('adminUser');
      if (!adminData) return;
      
      const admin = JSON.parse(adminData);
      
      const response = await fetch(`/api/admin/approved-users?organizationId=${admin.organization_id}`);
      if (response.ok) {
        const users = await response.json();
        setApprovedUsers(users);
      } else {
        throw new Error('Failed to load approved users');
      }
    } catch (error) {
      console.error('Error loading approved users:', error);
      addNotification('Failed to load approved users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeApproval = async (userId: string, userName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Revoke User Approval',
      message: `Are you sure you want to revoke approval for ${userName}? This will move them back to pending status and they will lose access to the system.`,
      type: 'danger',
      onConfirm: () => performRevokeApproval(userId, userName)
    });
  };

  const performRevokeApproval = async (userId: string, userName: string) => {
    try {
      setProcessingUsers(prev => new Set(prev).add(userId));
      
      const response = await fetch(`/api/admin/revoke-approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setApprovedUsers(prev => prev.filter(user => user.id !== userId));
        addNotification(`${userName}'s approval has been revoked`, 'success');
        onUpdate(); // Update dashboard counts
      } else {
        throw new Error('Failed to revoke approval');
      }
    } catch (error) {
      console.error('Error revoking approval:', error);
      addNotification(`Failed to revoke approval for ${userName}`, 'error');
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const getAgentDownloadLink = (operatingSystem: string, adminIP: string, endpointName: string, intensity: IntensityLevel) => {
    const baseUrl = 'http://localhost:3000'; // Will be replaced with actual frontend URL later
    const os = operatingSystem.toLowerCase();
    
    // Generate secure token for URL integrity
    const generateSecureToken = (adminIP: string, endpointName: string, intensity: string) => {
      const timestamp = Date.now().toString();
      const randomBytes = Math.random().toString(36).substring(2, 15);
      // Create a more reliable base token using a simple hash approach
      const dataString = `${adminIP}-${endpointName}-${intensity}`;
      const baseToken = btoa(dataString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
      return `${baseToken}${randomBytes}${timestamp.slice(-8)}`;
    };
    
    const secureToken = generateSecureToken(adminIP, endpointName, intensity);
    console.log('Generated secure token for', { adminIP, endpointName, intensity, token: secureToken });
    
    const params = new URLSearchParams({
      adminIP: adminIP,
      endpointName: endpointName,
      intensity: intensity,
      token: secureToken
    });
    
    if (os.includes('linux') || os.includes('ubuntu') || os.includes('debian') || os.includes('centos') || os.includes('rhel')) {
      return `${baseUrl}/agent/linux?${params.toString()}`;
    } else if (os.includes('windows')) {
      return `${baseUrl}/agent/windows?${params.toString()}`;
    } else {
      // Default to windows for unknown OS
      return `${baseUrl}/agent/windows?${params.toString()}`;
    }
  };

  const sendAgentEmail = async (user: ApprovedUser) => {
    try {
      console.log('=== Sending Agent Email ===');
      console.log('User:', user.full_name, user.email);
      
      setSendingEmails(prev => new Set(prev).add(user.id));
      
      const adminIP = await getAdminIP();
      const intensity = getEffectiveIntensity(user.id);
      const downloadLink = getAgentDownloadLink(user.operating_system, adminIP, user.full_name, intensity);
      console.log('Download link:', downloadLink);
      
      const emailData = {
        to: user.email,
        subject: 'NexusSentinel Agent Installation - Action Required',
        userInfo: {
          name: user.full_name,
          operatingSystem: user.operating_system,
          downloadLink: downloadLink,
          intensity: intensity
        }
      };
      
      console.log('Email data:', emailData);

      const response = await fetch('/api/admin/send-agent-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Success response:', responseData);
        addNotification(`Agent installation email sent to ${user.full_name} with ${intensity} intensity`, 'success');
        console.log('Notification added successfully');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      addNotification(`Failed to send email to ${user.full_name}`, 'error');
    } finally {
      setSendingEmails(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
    }
  };

  const sendBulkAgentEmails = async () => {
    if (filteredUsers.length === 0) {
      addNotification('No users available to send emails to', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Send Bulk Emails',
      message: `Are you sure you want to send agent installation emails to all ${filteredUsers.length} approved users? This will send individual emails with OS-specific download links and their selected intensity levels.`,
      type: 'info',
      onConfirm: () => performBulkEmailSend()
    });
  };

  const performBulkEmailSend = async () => {
    try {
      setSendingBulkEmail(true);
      
      const adminIP = await getAdminIP();
      
      const emailPromises = filteredUsers.map(user => {
        const intensity = getEffectiveIntensity(user.id);
        const downloadLink = getAgentDownloadLink(user.operating_system, adminIP, user.full_name, intensity);
        
        return fetch('/api/admin/send-agent-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: user.email,
            subject: 'NexusSentinel Agent Installation - Action Required',
            userInfo: {
              name: user.full_name,
              operatingSystem: user.operating_system,
              downloadLink: downloadLink,
              intensity: intensity
            }
          }),
        });
      });

      const results = await Promise.allSettled(emailPromises);
      
      const successful = results.filter(result => result.status === 'fulfilled' && result.value.ok).length;
      const failed = results.length - successful;

      if (successful > 0) {
        addNotification(`Successfully sent ${successful} email(s)${failed > 0 ? `, ${failed} failed` : ''}`, 'success');
      }
      
      if (failed > 0) {
        addNotification(`${failed} email(s) failed to send`, 'error');
      }
    } catch (error) {
      console.error('Error sending bulk emails:', error);
      addNotification('Failed to send bulk emails', 'error');
    } finally {
      setSendingBulkEmail(false);
    }
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {},
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading approved users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText={confirmDialog.type === 'danger' ? 'Revoke' : 'Send Emails'}
        cancelText="Cancel"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-white">Approved Endpoints</h1>
          <p className="text-gray-400">
            {approvedUsers.length} approved endpoint{approvedUsers.length !== 1 ? 's' : ''}
            {searchTerm && ` (${filteredUsers.length} matching search)`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {filteredUsers.length > 0 && (
            <>
              <Button
                onClick={() => setShowIntensitySettings(!showIntensitySettings)}
                className="flex items-center gap-2 px-4 py-2 text-purple-300 border bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 hover:border-purple-500/30"
              >
                <Settings className="w-4 h-4" />
                Intensity Settings
              </Button>
              <Button
                onClick={sendBulkAgentEmails}
                disabled={sendingBulkEmail}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 border hover:bg-blue-700 border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingBulkEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MailIcon className="w-4 h-4" />
                )}
                Email All ({filteredUsers.length})
              </Button>
            </>
          )}
          <Button
            onClick={loadApprovedUsers}
            className="flex items-center gap-2 px-4 py-2 text-white border bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 backdrop-blur-sm"
          >
            <RefreshCw className="w-4 h-4 text-white" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {approvedUsers.length > 0 && (
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, email, IP address, or OS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 pl-10 pr-4 text-white placeholder-gray-400 border rounded-lg bg-white/5 backdrop-blur-sm border-white/10 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
          />
          <Search className="absolute w-5 h-5 text-gray-100 transform -translate-y-1/2 left-3 top-1/2" />
        </div>
      )}

      {/* Intensity Settings Panel */}
      {showIntensitySettings && filteredUsers.length > 0 && (
        <div className="p-6 border bg-purple-500/5 backdrop-blur-sm border-purple-500/20 rounded-xl">
          <h3 className="mb-4 text-lg font-semibold text-white">Scanning Intensity Settings</h3>
          
          {/* Global Intensity Selector */}
          <div className="mb-6">
            <Label className="block mb-3 text-sm font-medium text-gray-300">
              Set intensity for all endpoints:
            </Label>
            <RadioGroup
              value={globalIntensity}
              onValueChange={(value: IntensityLevel) => setAllUsersIntensity(value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="global-high" className="text-red-400 border-red-500" />
                <Label htmlFor="global-high" className="text-red-300 cursor-pointer">High</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="global-medium" className="text-orange-400 border-orange-500" />
                <Label htmlFor="global-medium" className="text-orange-300 cursor-pointer">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="global-low" className="text-green-400 border-green-500" />
                <Label htmlFor="global-low" className="text-green-300 cursor-pointer">Low</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Individual User Intensity Settings */}
          <div>
            <Label className="block mb-3 text-sm font-medium text-gray-300">
              Individual endpoint settings:
            </Label>
            <div className="space-y-3 overflow-y-auto max-h-60">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg bg-white/5 border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                      <span className="text-xs font-bold text-purple-300">
                        {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <span className="text-sm text-white">{user.full_name}</span>
                  </div>
                  <RadioGroup
                    value={getEffectiveIntensity(user.id)}
                    onValueChange={(value: IntensityLevel) => setUserIntensity(user.id, value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="high" id={`${user.id}-high`} className="w-3 h-3 text-red-400 border-red-500" />
                      <Label htmlFor={`${user.id}-high`} className="text-xs text-red-300 cursor-pointer">H</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="medium" id={`${user.id}-medium`} className="w-3 h-3 text-orange-400 border-orange-500" />
                      <Label htmlFor={`${user.id}-medium`} className="text-xs text-orange-300 cursor-pointer">M</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="low" id={`${user.id}-low`} className="w-3 h-3 text-green-400 border-green-500" />
                      <Label htmlFor={`${user.id}-low`} className="text-xs text-green-300 cursor-pointer">L</Label>
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      {approvedUsers.length === 0 ? (
        <div className="py-12 text-center border bg-white/5 backdrop-blur-sm border-white/10 rounded-xl">
          <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="mb-2 text-xl font-semibold text-white">No Approved Users</h3>
          <p className="text-gray-400">Approved endpoint users will appear here.</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-12 text-center border bg-white/5 backdrop-blur-sm border-white/10 rounded-xl">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="mb-2 text-xl font-semibold text-white">No Results Found</h3>
          <p className="text-gray-400">No users match your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => {
            const isProcessing = processingUsers.has(user.id);
            
            return (
              <div
                key={user.id}
                className="p-6 transition-all duration-200 border bg-white/5 backdrop-blur-sm border-green-500/20 rounded-xl hover:border-green-500/30"
              >
                <div className="flex items-center gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-16 h-16 border rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500/30">
                      <span className="text-lg font-bold text-green-300">
                        {getInitials(user.full_name)}
                      </span>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-white">
                              {user.full_name}
                            </h3>
                            <span className="px-2 py-1 text-xs font-bold text-green-300 border rounded-full bg-green-500/20 border-green-500/30">
                              Approved
                            </span>
                            <span className={`px-2 py-1 text-xs font-bold border rounded-full ${
                              getEffectiveIntensity(user.id) === 'high' ? 'text-red-300 bg-red-500/20 border-red-500/30' :
                              getEffectiveIntensity(user.id) === 'medium' ? 'text-orange-300 bg-orange-500/20 border-orange-500/30' :
                              'text-green-300 bg-green-500/20 border-green-500/30'
                            }`}>
                              {getEffectiveIntensity(user.id).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Globe className="w-4 h-4" />
                          <span>IP: {user.ip_address}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <HardDrive className="w-4 h-4" />
                          <span>{user.operating_system} {user.os_version}</span>
                        </div>
                        
                        <div className="text-sm text-gray-400">
                          <span>MAC: {user.mac_address}</span>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          <div>Registered: {formatDate(user.created_at)}</div>
                          {user.approved_at && (
                            <div>Approved: {formatDate(user.approved_at)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => sendAgentEmail(user)}
                        disabled={sendingEmails.has(user.id)}
                        className="flex items-center gap-2 px-4 py-2 text-blue-300 border bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 hover:border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingEmails.has(user.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Send Email
                      </Button>
                      <Button
                        onClick={() => handleRevokeApproval(user.id, user.full_name)}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 text-red-300 border bg-red-500/10 hover:bg-red-500/20 border-red-500/20 hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserX className="w-4 h-4" />
                        )}
                        Revoke
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApprovedUsersPage;

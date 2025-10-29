'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, RefreshCw, User, Mail, Globe, HardDrive, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';

interface PendingUser {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  operating_system: string;
  os_version: string;
  ip_address: string;
  mac_address: string;
  created_at: string;
  organization_id: string;
}

interface PendingUsersPageProps {
  onUpdate: () => void;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const PendingUsersPage: React.FC<PendingUsersPageProps> = ({ onUpdate, addNotification }) => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());
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
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      setIsLoading(true);
      const adminData = localStorage.getItem('adminUser');
      if (!adminData) return;
      
      const admin = JSON.parse(adminData);
      
      const response = await fetch(`/api/admin/pending-users?organizationId=${admin.organization_id}`);
      if (response.ok) {
        const users = await response.json();
        setPendingUsers(users);
      } else {
        throw new Error('Failed to load pending users');
      }
    } catch (error) {
      console.error('Error loading pending users:', error);
      addNotification('Failed to load pending users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId: string, userName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Approve User Access',
      message: `Are you sure you want to approve ${userName}? This will grant them access to the system and they will be able to install the NexusSentinel agent.`,
      type: 'info',
      onConfirm: () => performApprove(userId, userName)
    });
  };

  const performApprove = async (userId: string, userName: string) => {
    try {
      setProcessingUsers(prev => new Set(prev).add(userId));
      
      const response = await fetch(`/api/admin/approve-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        addNotification(`${userName} has been approved successfully`, 'success');
        onUpdate(); // Update dashboard counts
      } else {
        throw new Error('Failed to approve user');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      addNotification(`Failed to approve ${userName}`, 'error');
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleReject = async (userId: string, userName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reject User Application',
      message: `Are you sure you want to reject ${userName}? This action cannot be undone and they will need to re-register if they want to access the system.`,
      type: 'danger',
      onConfirm: () => performReject(userId, userName)
    });
  };

  const performReject = async (userId: string, userName: string) => {
    try {
      setProcessingUsers(prev => new Set(prev).add(userId));
      
      const response = await fetch(`/api/admin/reject-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        addNotification(`${userName} has been rejected`, 'success');
        onUpdate(); // Update dashboard counts
      } else {
        throw new Error('Failed to reject user');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      addNotification(`Failed to reject ${userName}`, 'error');
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
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
          <span>Loading pending users...</span>
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
        confirmText={confirmDialog.type === 'danger' ? 'Reject' : 'Approve'}
        cancelText="Cancel"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-white">Pending Approvals</h1>
          <p className="text-gray-400">
            {pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''} awaiting approval
          </p>
        </div>
        <Button
          onClick={loadPendingUsers}
          className="flex items-center gap-2 px-4 py-2 text-white border bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 backdrop-blur-sm"
        >
          <RefreshCw className="w-4 h-4 text-white" />
          Refresh
        </Button>
      </div>

      {/* Users List */}
      {pendingUsers.length === 0 ? (
        <div className="py-12 text-center border bg-white/5 backdrop-blur-sm border-white/10 rounded-xl">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="mb-2 text-xl font-semibold text-white">No Pending Approvals</h3>
          <p className="text-gray-400">All users have been processed. Great job!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingUsers.map((user) => {
            const isProcessing = processingUsers.has(user.id);
            
            return (
              <div
                key={user.id}
                className="p-6 transition-all duration-200 border bg-white/5 backdrop-blur-sm border-white/10 rounded-xl hover:border-white/20"
              >
                <div className="flex items-center gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-16 h-16 border rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
                      <span className="text-lg font-bold text-purple-300">
                        {getInitials(user.full_name)}
                      </span>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div className="space-y-3">
                        <div>
                          <h3 className="mb-1 text-lg font-semibold text-white">
                            {user.full_name}
                          </h3>
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
                          Registered: {formatDate(user.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-shrink-0 gap-3">
                    <Button
                      onClick={() => handleApprove(user.id, user.full_name)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2 text-green-300 border bg-green-500/10 hover:bg-green-500/20 border-green-500/20 hover:border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Approve
                    </Button>
                    
                    <Button
                      onClick={() => handleReject(user.id, user.full_name)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2 text-red-300 border bg-red-500/10 hover:bg-red-500/20 border-red-500/20 hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      Reject
                    </Button>
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

export default PendingUsersPage;

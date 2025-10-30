"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Building2,
  Mail,
  Edit,
  ArrowLeft,
  Shield,
  Settings,
  Phone,
  Bell,
  RefreshCw
} from "lucide-react";
import { API_URLS, apiRequest } from "@/utils/api";

interface AdminData {
  organization_name?: string;
  company_name?: string;
  username?: string;
  email?: string;
  email_address?: string;
  organization_id?: string;
  id?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProfileData {
  id?: string;
  company_size?: string;
  industry?: string;
  website?: string;
  address?: string;
  ceo_name?: string;
  company_registration?: string;
  country?: string;
  timezone?: string;
  contact_number?: string;
  full_name?: string;
  role?: string;
  backup_email?: string;
  ip_address?: string;
  alert_sensitivity?: string;
  mfa_enabled?: boolean;
  notify_email?: boolean;
  notify_sms?: boolean;
  notify_push?: boolean;
  endpoint_approval_mode?: string;
  endpoint_limit?: number;
  threat_response_mode?: string;
  device_verification_method?: string;
  security_contact_email?: string;
  created_at?: string;
  updated_at?: string;
}

export default function SimpleAdminProfile() {
  const router = useRouter();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setIsLoadingProfile(true);
    setIsLoadingUser(true);
    
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        router.push("/login");
        return;
      }

      // Load profile data from backend API first
      await loadProfileData(userId);
      
      // Load user data from backend API
      await loadUserData(userId);

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfileData = async (userId: string) => {
    try {
      // First try to get profile data from backend API
      try {
        const response = await apiRequest(API_URLS.ADMIN_PROFILE(userId), {
          method: "GET"
        });

        if (response.ok) {
          const profileData = await response.json();
          
          if (profileData) {
            setProfileData(profileData);
            setIsLoadingProfile(false);
            return;
          }
        }
      } catch (apiError) {
        console.error('Backend API error for profile:', apiError);
      }

      // Fallback: Direct Supabase query for profiles
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile from Supabase:', error);
        if (error.code === 'PGRST116') {
          // Create a basic profile if it doesn't exist
          await supabase.from('profiles').insert({ id: userId });
        }
      } else {
        setProfileData(profileData);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      // Direct Supabase query for users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user from Supabase:', error);
      } else {
        setAdminData(userData);
      }

      // Also try to load from localStorage as fallback
      const adminUserData = localStorage.getItem("adminUser");
      if (adminUserData && !adminData) {
        const adminUser = JSON.parse(adminUserData);
        setAdminData(prevData => prevData || adminUser);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleEditProfile = () => {
    router.push('/admin/setup?edit=true');
  };

  const handleBackToDashboard = () => {
    router.push('/admin/dashboard');
  };

  const handleRefreshProfile = () => {
    loadAdminData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
          <div className="mb-2 text-white">Loading admin profile...</div>
          <div className="text-sm text-gray-400">
            {isLoadingProfile && "Loading profile data..."}
            {isLoadingUser && !isLoadingProfile && "Loading user data..."}
          </div>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-red-400">No admin data found</div>
      </div>
    );
  }

  // Get data from users table (basic info)
  const companyName = adminData?.organization_name || adminData?.company_name || profileData?.company_size || 'Not specified';
  const username = adminData?.username || adminData?.email?.split('@')[0] || 'Not specified';
  const email = adminData?.email_address || adminData?.email || profileData?.backup_email || 'Not specified';

  // Check if email is actually an email or username
  const displayEmail = email && email.includes('@') ? email : 'Not specified';
  const displayUsername = username;

  // Get data from profiles table (detailed profile info)
  const fullName = profileData?.full_name || adminData?.username || 'Admin User';
  const role = profileData?.role || 'Administrator';
  const companySize = profileData?.company_size || 'Not specified';
  const industry = profileData?.industry || 'Not specified';
  const website = profileData?.website || 'Not specified';
  const address = profileData?.address || 'Not specified';
  const country = profileData?.country || 'Not specified';
  const timezone = profileData?.timezone || 'Not specified';
  const phoneNumber = profileData?.contact_number || 'Not specified';
  const backupEmail = profileData?.backup_email || 'Not specified';
  const ipAddress = profileData?.ip_address || 'Not specified';
  const alertSensitivity = profileData?.alert_sensitivity || 'Not specified';
  const mfaEnabled = profileData?.mfa_enabled ? 'Enabled' : 'Not configured';
  const threatResponseMode = profileData?.threat_response_mode || 'Not specified';
  const deviceVerificationMethod = profileData?.device_verification_method || 'Not specified';
  const securityContactEmail = profileData?.security_contact_email || 'Not specified';
  const notifyEmail = profileData?.notify_email ? 'On' : 'Off';
  const notifySms = profileData?.notify_sms ? 'On' : 'Off';
  const notifyPush = profileData?.notify_push ? 'On' : 'Off';
  const endpointApprovalMode = profileData?.endpoint_approval_mode || 'Not specified';
  const endpointLimit = profileData?.endpoint_limit || 'Not specified';
  const ceoName = profileData?.ceo_name || 'Not specified';
  const companyRegistration = profileData?.company_registration || 'Not specified';

  // Generate avatar initials
  const getAvatarInitials = () => {
    if (fullName && fullName !== 'Admin User') {
      return fullName.split(' ').map(name => name.charAt(0)).join('').substring(0, 2).toUpperCase();
    } else if (username && username !== 'Not specified') {
      return username.substring(0, 2).toUpperCase();
    } else {
      return 'AD';
    }
  };

  return (
    <div className="min-h-screen text-white bg-black">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="px-6 py-4 mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Profile</h1>
                <p className="text-gray-400">View and manage your profile information</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefreshProfile}
                variant="outline"
                disabled={loading}
                className="text-gray-300 border-gray-600 hover:text-white hover:border-gray-500"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleEditProfile}
                className="text-white bg-purple-600 hover:bg-purple-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="px-6 py-8 mx-auto max-w-7xl">
        
        {/* Profile Header Section */}
        <div className="mb-8">
          <Card className="border-gray-800 bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-6 md:flex-row">
                {/* Avatar */}
                <div className="relative">
                  <div className="flex items-center justify-center w-32 h-32 rounded-full shadow-lg bg-gradient-to-br from-purple-500 to-blue-500">
                    <span className="text-4xl font-bold text-white">
                      {getAvatarInitials()}
                    </span>
                  </div>
                  <div className="absolute w-6 h-6 bg-green-500 border-4 border-gray-900 rounded-full bottom-2 right-2"></div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="mb-2 text-3xl font-bold text-white">{fullName}</h2>
                  <p className="mb-2 text-xl text-blue-400">{role}</p>
                  <p className="mb-4 text-gray-300">@{displayUsername}</p>
                  
                  <div className="flex flex-wrap justify-center gap-4 md:justify-start">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/50">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-300">{companyName}</span>
                    </div>
                    {displayEmail !== 'Not specified' && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/50">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-300">{displayEmail}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-800/30">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-green-400">Online</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
                  <div className="p-4 text-center rounded-lg bg-gray-800/30">
                    <div className="text-2xl font-bold text-white">{mfaEnabled === 'Enabled' ? '✓' : '○'}</div>
                    <div className="text-xs text-gray-400">2FA Status</div>
                  </div>
                  <div className="p-4 text-center rounded-lg bg-gray-800/30">
                    <div className="text-2xl font-bold text-white">{alertSensitivity !== 'Not specified' ? alertSensitivity.charAt(0).toUpperCase() : '?'}</div>
                    <div className="text-xs text-gray-400">Alert Level</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Company Information */}
            <Card className="border-gray-800 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-gray-400">Company Name</label>
                  <p className="text-white">{companyName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Industry</label>
                  <p className="text-white">{industry}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Company Size</label>
                  <p className="text-white">{companySize}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">CEO Name</label>
                  <p className="text-white">{ceoName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Website</label>
                  <p className="text-white break-all">{website}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Registration</label>
                  <p className="text-white">{companyRegistration}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-400">Address</label>
                  <p className="text-white">{address}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Country</label>
                  <p className="text-white">{country}</p>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="border-gray-800 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="w-5 h-5 text-blue-400" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-gray-400">Full Name</label>
                  <p className="text-white">{fullName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Role</label>
                  <p className="text-white">{role}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Username</label>
                  <p className="text-white">{displayUsername}</p>
                </div>
                {displayEmail !== 'Not specified' && (
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white break-all">{displayEmail}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-400">Phone Number</label>
                  <p className="text-white">{phoneNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Backup Email</label>
                  <p className="text-white break-all">{backupEmail}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Timezone</label>
                  <p className="text-white">{timezone}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Account Created</label>
                  <p className="text-white">
                    {adminData?.created_at 
                      ? new Date(adminData.created_at).toLocaleDateString() 
                      : profileData?.created_at 
                        ? new Date(profileData.created_at).toLocaleDateString()
                        : 'Not specified'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="border-gray-800 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Bell className="w-5 h-5 text-green-400" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-white">Email Notifications</span>
                    </div>
                    <span className={`text-sm px-3 py-1 rounded-full ${notifyEmail === 'On' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {notifyEmail}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-white">SMS Notifications</span>
                    </div>
                    <span className={`text-sm px-3 py-1 rounded-full ${notifySms === 'On' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {notifySms}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-gray-400" />
                      <span className="text-white">Push Notifications</span>
                    </div>
                    <span className={`text-sm px-3 py-1 rounded-full ${notifyPush === 'On' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {notifyPush}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Security Settings */}
            <Card className="border-gray-800 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Shield className="w-5 h-5 text-red-400" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-gray-400">Alert Sensitivity</label>
                  <p className="text-white">{alertSensitivity}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Multi-Factor Authentication</label>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${mfaEnabled === 'Enabled' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    <p className="text-white">{mfaEnabled}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Threat Response Mode</label>
                  <p className="text-white">{threatResponseMode}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Device Verification</label>
                  <p className="text-white">{deviceVerificationMethod}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-400">Security Contact Email</label>
                  <p className="text-white break-all">{securityContactEmail}</p>
                </div>
              </CardContent>
            </Card>

            {/* Technical Configuration */}
            <Card className="border-gray-800 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="w-5 h-5 text-orange-400" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-gray-400">Server IP Address</label>
                  <p className="text-white rounded ">{ipAddress}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Endpoint Limit</label>
                  <p className="text-white">{endpointLimit}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Endpoint Approval Mode</label>
                  <p className="text-white">{endpointApprovalMode}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Last Profile Update</label>
                  <p className="text-white">
                    {profileData?.updated_at 
                      ? new Date(profileData.updated_at).toLocaleDateString() 
                      : 'Not specified'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Account Summary */}
            <Card className="border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="w-5 h-5 text-cyan-400" />
                  Account Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 text-center rounded-lg bg-gray-800/30">
                    <div className="text-2xl font-bold text-green-400">{mfaEnabled === 'Enabled' ? '🔒' : '🔓'}</div>
                    <div className="mt-1 text-sm text-gray-400">Security</div>
                    <div className="text-xs text-gray-500">{mfaEnabled}</div>
                  </div>
                  <div className="p-4 text-center rounded-lg bg-gray-800/30">
                    <div className="text-2xl font-bold text-blue-400">📊</div>
                    <div className="mt-1 text-sm text-gray-400">Alerts</div>
                    <div className="text-xs text-gray-500">{alertSensitivity}</div>
                  </div>
                  <div className="p-4 text-center rounded-lg bg-gray-800/30">
                    <div className="text-2xl font-bold text-purple-400">🌐</div>
                    <div className="mt-1 text-sm text-gray-400">Server</div>
                    <div className="text-xs text-gray-500">Online</div>
                  </div>
                  <div className="p-4 text-center rounded-lg bg-gray-800/30">
                    <div className="text-2xl font-bold text-orange-400">📱</div>
                    <div className="mt-1 text-sm text-gray-400">Endpoints</div>
                    <div className="text-xs text-gray-500">{endpointLimit || '∞'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}

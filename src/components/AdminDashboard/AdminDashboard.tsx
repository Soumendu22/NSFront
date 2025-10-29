'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserCheck,
  UserX,
  Upload,
  BarChart3,
  Menu,
  X,
  Bell,
  LogOut,
  AlertTriangle,
  Settings,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationContainer, useNotifications } from '@/components/ui/notification';
import { supabase } from '@/lib/supabaseClient';
import { API_URLS, apiRequest } from '@/utils/api';

// Import dashboard pages
import PendingUsersPage from './PendingUsersPage';
import ApprovedUsersPage from './ApprovedUsersPage';
import BulkUploadPage from './BulkUploadPage';
import DashboardOverview from './DashboardOverview';
import WazuhInstallationPage from './WazuhInstallationPage';
import AnalyticsDashboard from './AnalyticsDashboard';

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  organization_id: string;
  organization_name: string;
}

interface AdminProfile {
  id: string;
  full_name?: string;
  company_size?: string;
  ip_address?: string;
  role?: string;
  contact_number?: string;
  backup_email?: string;
}

interface DashboardCounts {
  pendingCount: number;
  approvedCount: number;
  totalCount: number;
}

type DashboardSection = 'overview' | 'pending' | 'approved' | 'bulk-upload' | 'wazuh-installation' | 'analytics';

export const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { notifications, addNotification, removeNotification } = useNotifications();
  
  // Wrapper function to match child component interface
  const handleNotification = (message: string, type: 'success' | 'error' | 'info') => {
    addNotification(type, type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info', message);
  };
  
  // State management
  const [currentSection, setCurrentSection] = useState<DashboardSection>('overview');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const [dashboardCounts, setDashboardCounts] = useState<DashboardCounts>({
    pendingCount: 0,
    approvedCount: 0,
    totalCount: 0
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showWazuhConfirmation, setShowWazuhConfirmation] = useState(false);

  // Load admin user data and dashboard counts
  useEffect(() => {
    loadAdminData();
    loadDashboardCounts();
  }, []);

  // Re-check setup when page comes into focus (user returns from setup)
  useEffect(() => {
    const handleFocus = () => {
      checkAdminSetup();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Check admin setup completion
  const checkAdminSetup = async () => {
    try {
      const storedUserId = localStorage.getItem("userId");
      if (!storedUserId) {
        router.push("/admin/login");
        return;
      }

      // Get profile data via backend API
      try {
        const response = await apiRequest(API_URLS.ADMIN_PROFILE(storedUserId));

        if (response.ok) {
          const profileData = await response.json();
          console.log('Profile data from API:', profileData);
          console.log('Setup check - company_size:', profileData?.company_size);
          console.log('Setup check - full_name:', profileData?.full_name);
          console.log('Setup check - ip_address:', profileData?.ip_address);

          // Check if setup is complete: company_size, full_name, and ip_address are required
          if (profileData && profileData.company_size && profileData.full_name && profileData.ip_address) {
            console.log('Setup is COMPLETE');
            setAdminProfile(profileData);
            setSetupComplete(true);
          } else {
            console.log('Setup is INCOMPLETE');
            setAdminProfile(profileData || null);
            setSetupComplete(false);
          }
          return;
        }
      } catch (apiError) {
        console.error('Backend API error:', apiError);
      }

      // Fallback: Direct Supabase query
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', storedUserId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No profile found, create one for this user
        await supabase.from('profiles').insert({ id: storedUserId });
        setAdminProfile(null);
        setSetupComplete(false);
      } else if (error) {
        // Other database error
        setAdminProfile(null);
        setSetupComplete(false);
      } else if (data && data.company_size && data.company_size.trim() !== '' && data.full_name && data.full_name.trim() !== '' && data.ip_address && data.ip_address.trim() !== '') {
        // Setup is complete - company_size, full_name, and ip_address are required
        setAdminProfile(data);
        setSetupComplete(true);
      } else {
        // Setup is incomplete
        setAdminProfile(data || null);
        setSetupComplete(false);
      }
    } catch (error) {
      console.error('Setup check error:', error);
      setAdminProfile(null);
      setSetupComplete(false);
    }
  };

  const loadAdminData = async () => {
    try {
      // Get admin user from localStorage or session
      const adminData = localStorage.getItem('adminUser');
      if (adminData) {
        setAdminUser(JSON.parse(adminData));
        // Check admin setup completion
        await checkAdminSetup();
      } else {
        // Redirect to login if no admin data
        router.push('/admin/login');
        return;
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      router.push('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardCounts = async () => {
    try {
      const adminData = localStorage.getItem('adminUser');
      if (!adminData) return;
      
      const admin = JSON.parse(adminData);
      
      const response = await fetch(`/api/admin/dashboard-counts?organizationId=${admin.organization_id}`);
      if (response.ok) {
        const counts = await response.json();
        setDashboardCounts(counts);
      }
    } catch (error) {
      console.error('Error loading dashboard counts:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    router.push('/login');
  };

  const handleCompleteSetup = () => {
    router.push('/admin/setup');
  };

  const handleUpdateProfile = () => {
    router.push('/admin/setup?edit=true');
  };

  const refreshSetupStatus = () => {
    checkAdminSetup();
  };

  const handleWazuhInitiate = () => {
    setShowWazuhConfirmation(true);
  };

  const handleWazuhConfirm = () => {
    setShowWazuhConfirmation(false);
    // Navigate to Wazuh monitoring page
    router.push('/admin/wazuh-monitor');
  };

  const handleWazuhCancel = () => {
    setShowWazuhConfirmation(false);
  };

  const navigationItems = [
    {
      id: 'overview' as DashboardSection,
      label: 'Dashboard Overview',
      icon: BarChart3,
      count: null
    },
    {
      id: 'pending' as DashboardSection,
      label: 'Pending Approvals',
      icon: UserX,
      count: dashboardCounts.pendingCount
    },
    {
      id: 'approved' as DashboardSection,
      label: 'Approved',
      icon: UserCheck,
      count: dashboardCounts.approvedCount
    },
    {
      id: 'bulk-upload' as DashboardSection,
      label: 'Bulk Upload',
      icon: Upload,
      count: null
    },
    {
      id: 'wazuh-installation' as DashboardSection,
      label: 'Wazuh Installation',
      icon: Settings,
      count: null
    },
    {
      id: 'analytics' as DashboardSection,
      label: 'Analytics',
      icon: BarChart3,
      count: null
    }
  ];

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'overview':
        return <DashboardOverview counts={dashboardCounts} onRefresh={loadDashboardCounts} />;
      case 'pending':
        return <PendingUsersPage onUpdate={loadDashboardCounts} addNotification={handleNotification} />;
      case 'approved':
        return <ApprovedUsersPage onUpdate={loadDashboardCounts} addNotification={handleNotification} />;
      case 'bulk-upload':
        return <BulkUploadPage onUpdate={loadDashboardCounts} />;
      case 'wazuh-installation':
        return adminUser ? <WazuhInstallationPage adminUserId={adminUser.id} /> : null;
      case 'analytics':
        return adminUser ? <AnalyticsDashboard adminUserId={adminUser.id} onNotification={addNotification} /> : null;
      default:
        return <DashboardOverview counts={dashboardCounts} onRefresh={loadDashboardCounts} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-xl text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-black">
      {/* Mobile menu button */}
      <div className="fixed z-50 lg:hidden top-4 left-4">
        <Button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 border bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-black/90 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="font-bold text-white text-l">Admin Dashboard</h1>
              <p className="text-sm text-gray-400">{adminUser?.organization_name}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentSection(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                    : 'hover:bg-white/5 border border-transparent text-gray-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span className="">{item.label}</span>
                </div>
                {item.count !== null && item.count > 0 && (
                  <span className="px-2 py-1 text-xs font-bold text-red-300 border rounded-full bg-red-500/20 border-red-500/30">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Setup Status */}
          {!setupComplete ? (
            <div className="p-3 mt-4 border rounded-lg bg-yellow-500/10 border-yellow-500/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-300">Setup Incomplete</span>
              </div>
              <p className="mb-3 text-xs text-yellow-200">
                Please complete your admin profile setup to access all features.
              </p>
              <Button
                onClick={handleCompleteSetup}
                className="w-full p-2 text-xs text-yellow-300 border bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/40 hover:border-yellow-500/50"
              >
                <Settings className="w-3 h-3 mr-1" />
                Complete Setup
              </Button>
            </div>
          ) : (
            <div className="p-3 mt-4 border rounded-lg bg-green-500/10 border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">Profile Settings</span>
              </div>
              <p className="mb-3 text-xs text-green-200">
                Update your admin profile and preferences.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={handleUpdateProfile}
                  className="w-full p-2 text-xs text-green-300 border bg-green-500/20 hover:bg-green-500/30 border-green-500/40 hover:border-green-500/50"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Update Profile
                </Button>
                {/* <Button
                  onClick={refreshSetupStatus}
                  className="w-full p-1 text-xs text-gray-400 border bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/30 hover:border-gray-500/40"
                >
                  Refresh Status
                </Button> */}
              </div>
            </div>
          )}
        </nav>

        {/* Admin Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={() => router.push('/admin/profile')}
            className="flex items-center w-full gap-3 p-2 mb-3 transition-colors duration-200 rounded-lg hover:bg-white/5"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20">
              <span className="text-sm font-bold text-purple-300 capitalize">
                {adminUser?.full_name?.split(' ').map(n => n[0]).join('') || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white capitalize truncate">{adminUser?.full_name}</p>
              <p className="text-xs text-gray-400 truncate">{adminUser?.email}</p>
            </div>
          </button>
          <Button
            onClick={handleLogout}
            className="flex items-center w-full gap-2 p-2 text-sm text-red-300 border bg-red-500/10 hover:bg-red-500/20 border-red-500/20 hover:border-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="p-4 border-b bg-black/50 backdrop-blur-sm border-white/10 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="lg:hidden"></div> {/* Spacer for mobile */}
            <div className="flex-1 lg:flex-none">
              <h2 className="text-2xl font-bold text-white">
                {navigationItems.find(item => item.id === currentSection)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-4">
                <Button 
                  onClick={handleWazuhInitiate}
                  variant="outline" 
                  className='flex items-center gap-2 px-4 py-2 text-white border bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 backdrop-blur-sm'
                >
                  <Shield className="w-4 h-4" />
                  Initiate Wazuh
                </Button>
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-400" />
                {(dashboardCounts.pendingCount > 0) && (
                  <span className="absolute w-3 h-3 bg-red-500 rounded-full -top-1 -right-1"></span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {renderCurrentSection()}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />

      {/* Wazuh Confirmation Modal */}
      {showWazuhConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 mx-4 border rounded-lg bg-black/90 backdrop-blur-xl border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Shield className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Initiate Wazuh EDR</h3>
            </div>
            
            <div className="mb-6 space-y-4">
              <p className="text-gray-300">
                Before starting Wazuh EDR monitoring, please ensure you have completed the following steps:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg bg-white/5 border-white/10">
                  <CheckCircle className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">Wazuh Manager Installed</p>
                    <p className="text-xs text-gray-400">Wazuh manager is running on your server</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border rounded-lg bg-white/5 border-white/10">
                  <CheckCircle className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">Agents Deployed</p>
                    <p className="text-xs text-gray-400">Wazuh agents installed on endpoint devices</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border rounded-lg bg-white/5 border-white/10">
                  <CheckCircle className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">Network Configuration</p>
                    <p className="text-xs text-gray-400">Firewall and network rules properly configured</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border rounded-lg bg-white/5 border-white/10">
                  <CheckCircle className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">Credentials Configured</p>
                    <p className="text-xs text-gray-400">Wazuh manager credentials saved in NexusSentinel</p>
                  </div>
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-yellow-500/10 border-yellow-500/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-300">Important</p>
                    <p className="text-xs text-yellow-200">
                      Once initiated, Wazuh will begin monitoring all connected endpoints. Ensure all prerequisites are met.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleWazuhCancel}
                variant="outline"
                className="flex-1 px-4 py-2 text-gray-300 border bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleWazuhConfirm}
                className="flex-1 px-4 py-2 text-white bg-orange-600 border border-orange-500 hover:bg-orange-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                Start Monitoring
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

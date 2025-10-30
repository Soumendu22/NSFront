'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Server,
  Eye,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  ExternalLink,
  X,
  Play,
  Square,
  Settings,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { API_URLS, apiRequest } from '@/utils/api';

interface WazuhStats {
  connectedAgents: number;
  totalEndpoints: number;
  activeAlerts: number;
  criticalThreats: number;
  systemStatus: 'operational' | 'warning' | 'critical';
  lastUpdate: string;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  source: string;
  description: string;
  status: 'new' | 'investigating' | 'resolved';
}

export default function WazuhMonitorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingIP, setIsLoadingIP] = useState(true);
  const [showWazuhUI, setShowWazuhUI] = useState(false);
  const [adminIPAddress, setAdminIPAddress] = useState<string | null>(null);
  const [stats, setStats] = useState<WazuhStats>({
    connectedAgents: 0,
    totalEndpoints: 0,
    activeAlerts: 0,
    criticalThreats: 0,
    systemStatus: 'operational',
    lastUpdate: new Date().toISOString()
  });

  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);

  // Helper function to construct proper URL with port
  const getWazuhURL = (ipAddress: string | null) => {
    if (!ipAddress) return '';
    const cleanIP = ipAddress.includes(':') ? ipAddress : `${ipAddress}:443`;
    return `https://${cleanIP}`;
  };

  useEffect(() => {
    loadAdminData();
    loadMockData();
  }, []);

  const loadAdminData = async () => {
    setIsLoadingIP(true);
    try {
      const storedUserId = localStorage.getItem("userId");
      if (!storedUserId) {
        console.warn('No user ID found, redirecting to login');
        router.push("/admin/login");
        return;
      }

      console.log('Loading admin data for user ID:', storedUserId);

      // First try to get data from backend API
      try {
        const response = await apiRequest(API_URLS.ADMIN_PROFILE(storedUserId), {
          method: "GET"
        });

        if (response.ok) {
          const profileData = await response.json();
          console.log('Profile data from backend:', profileData);
          
          if (profileData && profileData.ip_address) {
            setAdminIPAddress(profileData.ip_address);
            console.log('Admin IP Address loaded from backend:', profileData.ip_address);
            console.log('IP Address type:', typeof profileData.ip_address);
            console.log('IP Address length:', profileData.ip_address.length);
            setIsLoadingIP(false);
            return; // Successfully got data, exit function
          } else {
            console.warn('Profile found but no IP address set');
            console.log('Full profile data:', profileData);
          }
        } else {
          console.warn('Backend API response not ok:', response.status);
        }
      } catch (apiError) {
        console.error('Backend API error:', apiError);
      }

      // Fallback: Direct Supabase query (same as AdminDashboard)
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', storedUserId)
        .single();

      if (error) {
        console.error('Error fetching admin profile:', error);
        if (error.code === 'PGRST116') {
          console.warn('Profile not found');
          // Create a basic profile if it doesn't exist
          await supabase.from('profiles').insert({ id: storedUserId });
        }
      } else if (profileData?.ip_address) {
        setAdminIPAddress(profileData.ip_address);
        console.log('Admin IP Address loaded from Supabase:', profileData.ip_address);
        console.log('Supabase IP Address type:', typeof profileData.ip_address);
        console.log('Supabase IP Address length:', profileData.ip_address.length);
      } else {
        console.warn('Profile found but no IP address set');
        console.log('Full profile data:', profileData);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoadingIP(false);
    }
  };

  const loadMockData = () => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        connectedAgents: 24,
        totalEndpoints: 27,
        activeAlerts: 3,
        criticalThreats: 1,
        systemStatus: 'operational',
        lastUpdate: new Date().toISOString()
      });

      setRecentEvents([
        {
          id: '1',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          severity: 'critical',
          type: 'Malware Detection',
          source: 'DESKTOP-ABC123',
          description: 'Suspicious executable detected and quarantined',
          status: 'investigating'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          severity: 'medium',
          type: 'Failed Login Attempt',
          source: 'LAPTOP-XYZ789',
          description: 'Multiple failed login attempts detected',
          status: 'new'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          severity: 'low',
          type: 'System Update',
          source: 'SERVER-MAIN01',
          description: 'Security patches installed successfully',
          status: 'resolved'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          severity: 'high',
          type: 'Network Anomaly',
          source: 'FIREWALL-01',
          description: 'Unusual network traffic pattern detected',
          status: 'resolved'
        }
      ]);

      setIsLoading(false);
    }, 2000);
  };

  const handleOpenWazuhUI = () => {
    if (adminIPAddress) {
      console.log('Opening Wazuh Web UI with IP:', adminIPAddress);
      setShowWazuhUI(true);
    } else {
      alert('IP address not found in your profile. Please update your profile settings to add your server IP address.');
    }
  };

  const handleCloseWazuhUI = () => {
    setShowWazuhUI(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-400';
      case 'investigating': return 'text-orange-400';
      case 'new': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen text-white bg-black">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
            <h2 className="text-xl font-bold text-white">Initializing Wazuh EDR</h2>
            <p className="text-gray-400">Connecting to security agents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-black">
      {/* Header */}
      <header className="p-6 border-b bg-black/50 backdrop-blur-sm border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex items-center gap-2 px-3 py-2 text-white border bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Shield className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Wazuh EDR Monitor</h1>
                <p className="text-sm text-gray-400">Real-time endpoint security monitoring</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              stats.systemStatus === 'operational' 
                ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                : 'bg-red-500/20 border-red-500/30 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                stats.systemStatus === 'operational' ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span className="text-sm font-medium capitalize">{stats.systemStatus}</span>
            </div>
            
            {/* IP Status Indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              isLoadingIP 
                ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                : adminIPAddress 
                  ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                  : 'bg-red-500/20 border-red-500/30 text-red-400'
            }`}>
              {isLoadingIP ? (
                <div className="w-2 h-2 border border-yellow-400 rounded-full border-t-transparent animate-spin"></div>
              ) : (
                <div className={`w-2 h-2 rounded-full ${
                  adminIPAddress ? 'bg-blue-400' : 'bg-red-400'
                }`}></div>
              )}
              <span className="text-sm font-medium">
                {isLoadingIP ? 'Loading IP...' : adminIPAddress ? `IP: ${adminIPAddress}` : 'No IP Set'}
              </span>
            </div>
            
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex items-center gap-2 px-3 py-2 text-white border bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
      
       

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-1">
          <Button 
            onClick={handleOpenWazuhUI}
            disabled={!adminIPAddress || isLoadingIP}
            className={`flex items-center justify-center gap-3 p-6 text-white rounded-lg transition-all duration-200 ${
              adminIPAddress && !isLoadingIP
                ? 'bg-blue-600 hover:bg-blue-700 border border-blue-500 cursor-pointer' 
                : 'bg-gray-600 cursor-not-allowed opacity-50 border border-gray-500'
            }`}
            title={
              isLoadingIP 
                ? 'Loading IP address...' 
                : adminIPAddress 
                  ? `Open Wazuh Web UI at ${adminIPAddress}:443` 
                  : 'Configure IP address in profile settings'
            }
          >
            <Globe className="w-5 h-5" />
            <span>Open Wazuh Web UI</span>
            {isLoadingIP && (
              <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
            )}
            {adminIPAddress && !isLoadingIP && <ExternalLink className="w-4 h-4" />}
            {!adminIPAddress && !isLoadingIP && (
              <span className="px-2 py-1 ml-2 text-xs text-yellow-300 rounded bg-yellow-500/20">
                IP Required
              </span>
            )}
          </Button>
         
        </div>
      </main>

      {/* Wazuh Web UI Modal */}
      {showWazuhUI && adminIPAddress && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col w-full h-full max-w-full mx-auto bg-black">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-black/90 backdrop-blur-xl border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Wazuh Web UI</h3>
                  <p className="text-sm text-gray-400">
                    {getWazuhURL(adminIPAddress)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    const url = getWazuhURL(adminIPAddress);
                    console.log('Admin IP Address:', adminIPAddress);
                    console.log('Final URL for new tab:', url);
                    window.open(url, '_blank');
                  }}
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-2 text-white border bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </Button>
                <Button
                  onClick={handleCloseWazuhUI}
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-2 text-white border bg-red-500/20 hover:bg-red-500/30 border-red-500/30 hover:border-red-500/40"
                >
                  <X className="w-4 h-4" />
                  Close
                </Button>
              </div>
            </div>
            
            {/* iframe Container */}
            <div className="relative flex-1">
              <iframe
                src={getWazuhURL(adminIPAddress)}
                // src='https://www.youtube.com/'
                className="w-full h-full border-0"
                title="Wazuh Web UI"
                onError={(e) => {
                  console.error('Error loading Wazuh Web UI:', e);
                  // Hide loading overlay on error
                  const loadingOverlay = document.getElementById('iframe-loading');
                  if (loadingOverlay) {
                    loadingOverlay.style.display = 'none';
                  }
                }}
                onLoad={() => {
                  console.log('Wazuh Web UI loaded successfully');
                  // Hide loading overlay on successful load
                  const loadingOverlay = document.getElementById('iframe-loading');
                  if (loadingOverlay) {
                    loadingOverlay.style.display = 'none';
                  }
                }}
              />
              
              {/* Loading overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm" id="iframe-loading">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                  <p className="text-white">Loading Wazuh Web UI...</p>
                  <p className="text-sm text-gray-400">
                    Connecting to {getWazuhURL(adminIPAddress)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t bg-black/90 backdrop-blur-xl border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Connected to Wazuh Manager at {adminIPAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="flex items-center gap-2 px-3 py-1 text-sm text-white border bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

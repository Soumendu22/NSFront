'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  ScatterChart,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Building2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Activity, 
  Shield, 
  RefreshCw,
  Calendar,
  BarChart3,
  Download,
  Filter,
  Eye,
  Zap,
  Target,
  Globe,
  Monitor,
  Smartphone,
  Laptop,
  Server,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  TrendingDown
} from 'lucide-react';
import { API_URLS, apiRequest } from '@/utils/api';

interface AnalyticsDashboardProps {
  adminUserId: string;
  onNotification: (type: 'success' | 'error', title: string, message: string, options?: { duration?: number }) => void;
}

interface UserTrendData {
  date: string;
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

interface OrganizationData {
  name: string;
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

interface ApprovalStatusData {
  approved: { count: number; percentage: number };
  pending: { count: number; percentage: number };
  rejected: { count: number; percentage: number };
  total: number;
}

interface SystemStatusData {
  totalUsers: number;
  activeEndpoints: number;
  totalDepartments: number;
  organizationName: string;
  wazuhIntegrated: boolean;
  systemHealth: string;
  lastUpdated: string;
}

interface ActivityData {
  id: string;
  type: string;
  status: string;
  user: string;
  organization: string;
  timestamp: string;
  description: string;
}

interface DeviceData {
  device: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface SecurityMetrics {
  threatLevel: 'low' | 'medium' | 'high';
  securityScore: number;
  vulnerabilities: number;
  lastScan: string;
  incidents: number;
}

interface GrowthMetrics {
  currentPeriod: number;
  previousPeriod: number;
  growthRate: number;
  trend: 'up' | 'down' | 'stable';
}

interface TimeSeriesData {
  time: string;
  value: number;
  category?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ adminUserId, onNotification }) => {
  const [timeRange, setTimeRange] = useState('30');
  const [isLoading, setIsLoading] = useState(true);
  const [userTrends, setUserTrends] = useState<UserTrendData[]>([]);
  const [organizationData, setOrganizationData] = useState<OrganizationData[]>([]);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatusData | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatusData | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityData[]>([]);
  const [deviceAnalytics, setDeviceAnalytics] = useState<DeviceData[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(null);
  const [hourlyActivity, setHourlyActivity] = useState<TimeSeriesData[]>([]);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'security'>('overview');
  const [selectedMetric, setSelectedMetric] = useState<string>('registrations');

  // Enhanced color scheme for charts
  const colors = {
    primary: '#3B82F6',      // Blue
    success: '#10B981',      // Green  
    warning: '#F59E0B',      // Yellow
    danger: '#EF4444',       // Red
    secondary: '#6B7280',    // Gray
    accent: '#8B5CF6',       // Purple
    info: '#06B6D4',         // Cyan
    rose: '#F43F5E',         // Rose
    emerald: '#059669',      // Emerald
    orange: '#EA580C',       // Orange
    indigo: '#4F46E5',       // Indigo
    teal: '#0D9488',         // Teal
    cyan: '#06B6D4',         // Cyan (alias for info)
    purple: '#8B5CF6'        // Purple (alias for accent)
  };

  const gradients = {
    primary: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    success: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
    warning: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    danger: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    purple: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    cyan: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)'
  };

  const pieColors = [colors.primary, colors.success, colors.warning, colors.danger, colors.accent, colors.secondary, colors.info, colors.rose];

  useEffect(() => {
    fetchAllAnalytics();
  }, [timeRange, selectedMetric]);

  const fetchAllAnalytics = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching analytics for admin:', adminUserId);
      await Promise.all([
        fetchUserTrends(),
        fetchOrganizationDistribution(),
        fetchApprovalStatus(),
        fetchSystemStatus(),
        fetchRecentActivity(),
        fetchDeviceAnalytics(),
        fetchSecurityMetrics(),
        fetchGrowthMetrics(),
        fetchHourlyActivity()
      ]);
      console.log('Analytics fetch completed');
    } catch (error) {
      console.error('Error fetching analytics:', error);
      onNotification('error', 'Analytics Error', 'Failed to load analytics data. Check console for details.', { duration: 8000 });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserTrends = async () => {
    try {
      console.log('Fetching user trends...');
      const response = await apiRequest(API_URLS.ANALYTICS_USER_TRENDS(timeRange, adminUserId));
      console.log('User trends response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('User trends data:', data);
        setUserTrends(data.data);
      } else {
        const errorText = await response.text();
        console.error('User trends error:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching user trends:', error);
    }
  };

  const fetchOrganizationDistribution = async () => {
    try {
      const response = await apiRequest(API_URLS.ANALYTICS_ORGANIZATION_DISTRIBUTION(adminUserId));
      if (response.ok) {
        const data = await response.json();
        setOrganizationData(data.data.slice(0, 8)); // Top 8 departments/teams
      }
    } catch (error) {
      console.error('Error fetching department distribution:', error);
    }
  };

  const fetchApprovalStatus = async () => {
    try {
      const response = await apiRequest(API_URLS.ANALYTICS_APPROVAL_STATUS(adminUserId));
      if (response.ok) {
        const data = await response.json();
        setApprovalStatus(data);
      }
    } catch (error) {
      console.error('Error fetching approval status:', error);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const response = await apiRequest(API_URLS.ANALYTICS_SYSTEM_STATUS(adminUserId));
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data);
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await apiRequest(API_URLS.ANALYTICS_RECENT_ACTIVITY(10, adminUserId));
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data.data);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  // New analytics fetch functions
  const fetchDeviceAnalytics = async () => {
    try {
      const response = await apiRequest(API_URLS.ANALYTICS_DEVICE_ANALYTICS(adminUserId));
      if (response.ok) {
        const data = await response.json();
        setDeviceAnalytics(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching device analytics:', error);
    }
  };

  const fetchSecurityMetrics = async () => {
    try {
      const response = await apiRequest(API_URLS.ANALYTICS_SECURITY_METRICS(adminUserId));
      if (response.ok) {
        const data = await response.json();
        setSecurityMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching security metrics:', error);
    }
  };

  const fetchGrowthMetrics = async () => {
    try {
      const response = await apiRequest(API_URLS.ANALYTICS_GROWTH_METRICS(timeRange, adminUserId));
      if (response.ok) {
        const data = await response.json();
        setGrowthMetrics({
          currentPeriod: data.currentPeriod,
          previousPeriod: data.previousPeriod,
          growthRate: data.growthRate,
          trend: data.trend
        });
      }
    } catch (error) {
      console.error('Error fetching growth metrics:', error);
    }
  };

  const fetchHourlyActivity = async () => {
    try {
      const response = await apiRequest(API_URLS.ANALYTICS_HOURLY_ACTIVITY(adminUserId));
      if (response.ok) {
        const data = await response.json();
        setHourlyActivity(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching hourly activity:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable', size = 'w-4 h-4') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className={`${size} text-green-400`} />;
      case 'down':
        return <ArrowDown className={`${size} text-red-400`} />;
      default:
        return <Minus className={`${size} text-gray-400`} />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'windows':
        return <Monitor className="w-5 h-5 text-blue-400" />;
      case 'macos':
        return <Laptop className="w-5 h-5 text-gray-400" />;
      case 'linux':
        return <Server className="w-5 h-5 text-orange-400" />;
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-green-400" />;
      default:
        return <Monitor className="w-5 h-5 text-purple-400" />;
    }
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const exportData = () => {
    // Export functionality - would generate CSV/PDF reports
    onNotification('success', 'Export Started', 'Generating analytics report...', { duration: 3000 });
    // Implementation for actual export would go here
  };

  // Prepare pie chart data for approval status
  const approvalPieData = approvalStatus ? [
    { name: 'Approved', value: approvalStatus.approved.count, color: colors.success },
    { name: 'Pending', value: approvalStatus.pending.count, color: colors.warning },
    { name: 'Rejected', value: approvalStatus.rejected.count, color: colors.danger }
  ].filter(item => item.value > 0) : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <div className="w-8 h-8 border-b-2 border-blue-400 rounded-full animate-spin"></div>
        </div>
        
        {/* Loading skeletons */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="w-3/4 h-4 mb-2 rounded bg-white/20"></div>
                  <div className="w-1/2 h-8 rounded bg-white/20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="w-1/2 h-6 mb-4 rounded bg-white/20"></div>
                  <div className="h-64 rounded bg-white/20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="flex items-center gap-3 text-4xl font-bold text-white">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              Advanced Analytics
            </h1>
            <p className="text-lg text-gray-300">
              {systemStatus?.organizationName ? `${systemStatus.organizationName} • ` : ''}
              Comprehensive insights and performance metrics
            </p>
            {systemStatus?.lastUpdated && (
              <p className="text-sm text-gray-400">
                Last updated: {formatTimestamp(systemStatus.lastUpdated)}
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex p-1 rounded-lg bg-white/10">
              {(['overview', 'detailed', 'security'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    viewMode === mode
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Time Range Selector */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-sm text-white bg-transparent border-none outline-none"
              >
                <option value="7" className="bg-slate-800">Last 7 days</option>
                <option value="30" className="bg-slate-800">Last 30 days</option>
                <option value="90" className="bg-slate-800">Last 3 months</option>
                <option value="365" className="bg-slate-800">Last year</option>
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={exportData}
                variant="outline"
                size="sm"
                className="text-white border-white/20 hover:bg-white/10 hover:border-white/40"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <Button
                onClick={fetchAllAnalytics}
                variant="outline"
                size="sm"
                className="text-white border-white/20 hover:bg-white/10 hover:border-white/40"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced KPI Cards */}
        {systemStatus && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Users Card */}
            <Card className="relative overflow-hidden transition-all duration-300 group bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border-blue-500/30 hover:border-blue-400/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-200">Total Users</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-white">{systemStatus.totalUsers}</p>
                      {growthMetrics && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10">
                          {getTrendIcon(growthMetrics.trend, 'w-3 h-3')}
                          <span className="text-xs font-medium text-white">
                            {formatPercentage(growthMetrics.growthRate)}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-blue-300">Organization members</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/30">
                    <Users className="w-8 h-8 text-blue-200" />
                  </div>
                </div>
                <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-blue-500/5 to-transparent group-hover:opacity-100" />
              </CardContent>
            </Card>

            {/* Active Endpoints Card */}
            <Card className="relative overflow-hidden transition-all duration-300 group bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm border-green-500/30 hover:border-green-400/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-200">Active Endpoints</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-white">{systemStatus.activeEndpoints}</p>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-xs font-medium text-white">
                          {systemStatus.totalUsers > 0 ? Math.round((systemStatus.activeEndpoints / systemStatus.totalUsers) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-green-300">Approved & connected</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500/30">
                    <Zap className="w-8 h-8 text-green-200" />
                  </div>
                </div>
                <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-green-500/5 to-transparent group-hover:opacity-100" />
              </CardContent>
            </Card>

            {/* Security Score Card */}
            {securityMetrics && (
              <Card className="relative overflow-hidden transition-all duration-300 group bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border-purple-500/30 hover:border-purple-400/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-purple-200">Security Score</p>
                      <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-white">{securityMetrics.securityScore}</p>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                          securityMetrics.securityScore >= 80 ? 'bg-green-500/20' : 
                          securityMetrics.securityScore >= 60 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                        }`}>
                          <Shield className={`w-3 h-3 ${
                            securityMetrics.securityScore >= 80 ? 'text-green-400' :
                            securityMetrics.securityScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                          }`} />
                          <span className="text-xs font-medium text-white">
                            {securityMetrics.threatLevel.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-purple-300">{securityMetrics.vulnerabilities} vulnerabilities</p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-500/30">
                      <Shield className="w-8 h-8 text-purple-200" />
                    </div>
                  </div>
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-purple-500/5 to-transparent group-hover:opacity-100" />
                </CardContent>
              </Card>
            )}

            {/* Departments/Teams Card */}
            <Card className="relative overflow-hidden transition-all duration-300 group bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm border-orange-500/30 hover:border-orange-400/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-orange-200">Departments</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-white">{systemStatus.totalDepartments}</p>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10">
                        <Building2 className="w-3 h-3 text-orange-400" />
                        <span className="text-xs font-medium text-white">Active</span>
                      </div>
                    </div>
                    <p className="text-xs text-orange-300">OS/Platform distribution</p>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-500/30">
                    <Building2 className="w-8 h-8 text-orange-200" />
                  </div>
                </div>
                <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-orange-500/5 to-transparent group-hover:opacity-100" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 gap-8">
          {/* Registration Trends Chart - Full Width */}
          <Card className="transition-all duration-300 bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl text-white">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    Registration Trends
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Daily activity over the last {timeRange} days
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedMetric('registrations')}
                    className={`px-3 py-1 text-xs rounded-full transition-all ${
                      selectedMetric === 'registrations'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    Registrations
                  </button>
                  <button
                    onClick={() => setSelectedMetric('approvals')}
                    className={`px-3 py-1 text-xs rounded-full transition-all ${
                      selectedMetric === 'approvals'
                        ? 'bg-green-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    Approvals
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={userTrends}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.success} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={colors.success} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: '#F3F4F6',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
                    }}
                    labelFormatter={(value) => `Date: ${formatDate(value)}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke={colors.primary}
                    fill="url(#colorTotal)"
                    strokeWidth={2}
                    name="Total Registrations"
                  />
                  <Line
                    type="monotone"
                    dataKey="approved"
                    stroke={colors.success}
                    strokeWidth={2}
                    dot={{ fill: colors.success, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: colors.success }}
                    name="Approved"
                  />
                  <Bar dataKey="pending" fill={colors.warning} name="Pending" opacity={0.7} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Second Row: Heatmap and Device Analytics - 1/2 width each */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Hourly Activity Heatmap - 1/2 Width */}
            <Card className="transition-all duration-300 bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-white">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Activity Heatmap
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Hourly user activity patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={hourlyActivity}>
                    <defs>
                      <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.cyan} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={colors.cyan} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9CA3AF" 
                      fontSize={10} 
                      tickLine={false}
                      interval={2}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#F3F4F6',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
                      }}
                      labelFormatter={(value) => `Time: ${value}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={colors.cyan}
                      fill="url(#colorActivity)"
                      strokeWidth={2}
                      name="Activity"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Analytics - 1/2 Width */}
            <Card className="transition-all duration-300 bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-white">
                  <Monitor className="w-5 h-5 text-purple-400" />
                  Device Analytics
                </CardTitle>
                <CardDescription className="text-gray-400">
                  OS and device distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={organizationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.5} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9CA3AF" 
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '12px',
                          color: '#F3F4F6',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
                        }}
                      />
                      <Bar 
                        dataKey="total" 
                        fill={colors.primary} 
                        name="Total Users" 
                        radius={[4, 4, 0, 0]}
                        fillOpacity={0.8}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Device trend indicators */}
                  <div className="grid grid-cols-2 gap-3">
                    {deviceAnalytics.slice(0, 4).map((device, index) => (
                      <div key={device.device} className="p-3 border rounded-lg bg-white/5 border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          {getDeviceIcon(device.device)}
                          {getTrendIcon(device.trend)}
                        </div>
                        <p className="text-sm font-medium text-white">{device.device}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-bold text-white">{device.count}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            device.trend === 'up' ? 'bg-green-500/20 text-green-400' :
                            device.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {formatPercentage(device.change)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Third Row: Approval Status and Recent Activity - 1/2 width each */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Enhanced Approval Status - 1/2 Width */}
            <Card className="transition-all duration-300 bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-white">
                  <Target className="w-5 h-5 text-green-400" />
                  Approval Status
                </CardTitle>
                <CardDescription className="text-gray-400">
                  User approval distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={approvalPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {approvalPieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={entry.color}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '12px',
                          color: '#F3F4F6',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {approvalStatus && (
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-3 text-center border rounded-lg bg-green-500/10 border-green-500/20">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-lg font-bold text-green-400">{approvalStatus.approved.count}</span>
                        </div>
                        <p className="text-xs text-green-300">Approved ({approvalStatus.approved.percentage}%)</p>
                      </div>
                      <div className="p-3 text-center border rounded-lg bg-yellow-500/10 border-yellow-500/20">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-yellow-400" />
                          <span className="text-lg font-bold text-yellow-400">{approvalStatus.pending.count}</span>
                        </div>
                        <p className="text-xs text-yellow-300">Pending ({approvalStatus.pending.percentage}%)</p>
                      </div>
                      <div className="p-3 text-center border rounded-lg bg-red-500/10 border-red-500/20">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-lg font-bold text-red-400">{approvalStatus.rejected.count}</span>
                        </div>
                        <p className="text-xs text-red-300">Rejected ({approvalStatus.rejected.percentage}%)</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Recent Activity - 1/2 Width */}
            <Card className="transition-all duration-300 bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-white">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Latest organization events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="pr-2 space-y-3 overflow-y-auto max-h-120">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id} className="flex items-start gap-3 p-4 transition-all duration-200 border rounded-lg group border-white/5 hover:border-white/20 hover:bg-white/5">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`p-2 rounded-full ${
                          activity.status === 'approved' ? 'bg-green-500/20' :
                          activity.status === 'pending' ? 'bg-yellow-500/20' :
                          activity.status === 'rejected' ? 'bg-red-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          {getStatusIcon(activity.status)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white truncate transition-colors group-hover:text-blue-200">
                            {activity.user}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            activity.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            activity.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            activity.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-400 truncate">
                          {activity.organization}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            {activity.type}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatTimestamp(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {recentActivity.length === 0 && (
                    <div className="py-12 text-center">
                      <div className="flex items-center justify-center w-16 h-16 p-4 mx-auto mb-4 rounded-full bg-gray-500/10">
                        <Activity className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-400">No recent activity</p>
                      <p className="mt-1 text-xs text-gray-500">Activity will appear here as users interact with your organization</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Analytics Section for Detailed View */}
        {viewMode === 'detailed' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Growth Metrics */}
              {growthMetrics && (
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-white">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      Growth Analysis
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Period-over-period growth metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg bg-blue-500/10 border-blue-500/20">
                          <p className="mb-1 text-sm text-blue-300">Current Period</p>
                          <p className="text-2xl font-bold text-white">{growthMetrics.currentPeriod}</p>
                          <p className="text-xs text-blue-400">registrations</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-gray-500/10 border-gray-500/20">
                          <p className="mb-1 text-sm text-gray-300">Previous Period</p>
                          <p className="text-2xl font-bold text-white">{growthMetrics.previousPeriod}</p>
                          <p className="text-xs text-gray-400">registrations</p>
                        </div>
                      </div>
                      
                      <div className="p-6 border rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="mb-1 text-sm text-emerald-300">Growth Rate</p>
                            <div className="flex items-center gap-2">
                              <span className="text-3xl font-bold text-white">
                                {formatPercentage(growthMetrics.growthRate)}
                              </span>
                              {getTrendIcon(growthMetrics.trend, 'w-6 h-6')}
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-emerald-500/20">
                            <TrendingUp className="w-8 h-8 text-emerald-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Overview for Security View */}
              {securityMetrics && (
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-white">
                      <Shield className="w-5 h-5 text-purple-400" />
                      Security Overview
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Organization security metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Security Score Gauge */}
                      <div className="text-center">
                        <ResponsiveContainer width="100%" height={150}>
                          <RadialBarChart 
                            cx="50%" 
                            cy="50%" 
                            innerRadius="60%" 
                            outerRadius="90%" 
                            data={[{ value: securityMetrics.securityScore, fill: colors.purple }]}
                          >
                            <RadialBar
                              dataKey="value"
                              cornerRadius={10}
                              fill={colors.purple}
                            />
                          </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="mt-4">
                          <p className="text-3xl font-bold text-white">{securityMetrics.securityScore}</p>
                          <p className="text-sm text-gray-400">Security Score</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 text-center border rounded-lg bg-red-500/10 border-red-500/20">
                          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-400" />
                          <p className="text-xl font-bold text-white">{securityMetrics.vulnerabilities}</p>
                          <p className="text-xs text-red-300">Vulnerabilities</p>
                        </div>
                        <div className="p-3 text-center border rounded-lg bg-green-500/10 border-green-500/20">
                          <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-400" />
                          <p className="text-xl font-bold text-white">{securityMetrics.incidents}</p>
                          <p className="text-xs text-green-300">Incidents</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

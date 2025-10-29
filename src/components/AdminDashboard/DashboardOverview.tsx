'use client';

import React from 'react';
import { Users, UserCheck, UserX, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardCounts {
  pendingCount: number;
  approvedCount: number;
  totalCount: number;
}

interface DashboardOverviewProps {
  counts: DashboardCounts;
  onRefresh: () => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ counts, onRefresh }) => {
  const stats = [
    {
      title: 'Total Endpoints',
      value: counts.totalCount,
      icon: Users,
      color: 'blue',
      description: 'All registered endpoints'
    },
    {
      title: 'Approved Endpoints',
      value: counts.approvedCount,
      icon: UserCheck,
      color: 'green',
      description: 'Active and approved'
    },
    {
      title: 'Pending Approvals',
      value: counts.pendingCount,
      icon: UserX,
      color: 'red',
      description: 'Awaiting your approval'
    },
    {
      title: 'Approval Rate',
      value: counts.totalCount > 0 ? Math.round((counts.approvedCount / counts.totalCount) * 100) : 0,
      icon: TrendingUp,
      color: 'purple',
      description: 'Percentage approved',
      suffix: '%'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          icon: 'text-blue-400',
          text: 'text-blue-300'
        };
      case 'green':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          icon: 'text-green-400',
          text: 'text-green-300'
        };
      case 'red':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          icon: 'text-red-400',
          text: 'text-red-300'
        };
      case 'purple':
        return {
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/20',
          icon: 'text-purple-400',
          text: 'text-purple-300'
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/20',
          icon: 'text-gray-400',
          text: 'text-gray-300'
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-gray-400">Monitor and manage your organization's endpoint users</p>
        </div>
        <Button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 text-white border bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 backdrop-blur-sm"
        >
          <RefreshCw className="w-4 h-4 text-white" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = getColorClasses(stat.color);
          
          return (
            <div
              key={index}
              className={`p-6 rounded-xl border backdrop-blur-sm ${colors.bg} ${colors.border} hover:border-opacity-40 transition-all duration-200`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                {stat.color === 'red' && stat.value > 0 && (
                  <span className="px-2 py-1 text-xs font-bold text-red-300 border rounded-full bg-red-500/20 border-red-500/30">
                    Action Required
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">{stat.title}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    {stat.value}
                  </span>
                  {stat.suffix && (
                    <span className={`text-lg font-medium ${colors.text}`}>
                      {stat.suffix}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="p-6 border bg-white/5 backdrop-blur-sm border-white/10 rounded-xl">
        <h2 className="mb-4 text-xl font-semibold text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg bg-white/5 border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <UserX className="w-5 h-5 text-red-400" />
              <h3 className="font-medium text-white">Pending Approvals</h3>
            </div>
            <p className="mb-3 text-sm text-gray-400">
              {counts.pendingCount > 0 
                ? `${counts.pendingCount} users waiting for approval`
                : 'No pending approvals'
              }
            </p>
            <Button
              disabled={counts.pendingCount === 0}
              className="w-full text-sm text-red-300 border bg-red-500/10 hover:bg-red-500/20 border-red-500/20 hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {counts.pendingCount > 0 ? 'Review Pending' : 'No Action Needed'}
            </Button>
          </div>

          <div className="p-4 border rounded-lg bg-white/5 border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <UserCheck className="w-5 h-5 text-green-400" />
              <h3 className="font-medium text-white">Approved Users</h3>
            </div>
            <p className="mb-3 text-sm text-gray-400">
              {counts.approvedCount > 0 
                ? `${counts.approvedCount} active endpoints`
                : 'No approved users yet'
              }
            </p>
            <Button
              disabled={counts.approvedCount === 0}
              className="w-full text-sm text-green-300 border bg-green-500/10 hover:bg-green-500/20 border-green-500/20 hover:border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {counts.approvedCount > 0 ? 'Manage Users' : 'No Users Yet'}
            </Button>
          </div>

          <div className="p-4 border rounded-lg bg-white/5 border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="font-medium text-white">Bulk Upload</h3>
            </div>
            <p className="mb-3 text-sm text-gray-400">
              Upload multiple endpoints via Excel file
            </p>
            <Button className="w-full text-sm text-blue-300 border bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 hover:border-blue-500/30">
              Upload Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="p-6 border bg-white/5 backdrop-blur-sm border-white/10 rounded-xl">
        <h2 className="mb-4 text-xl font-semibold text-white">Recent Activity</h2>
        <div className="py-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-500" />
          <p className="text-gray-400">Activity tracking coming soon</p>
          <p className="mt-1 text-sm text-gray-500">
            View recent approvals, registrations, and system changes
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;

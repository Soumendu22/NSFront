'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboard } from '@/components/AdminDashboard/AdminDashboard';

export default function AdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('adminUser');
    if (!adminData) {
      router.push('/admin/login');
      return;
    }

    // Validate admin data
    try {
      const admin = JSON.parse(adminData);
      if (!admin.id || !admin.organization_id) {
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
        return;
      }
    } catch (error) {
      console.error('Invalid admin data:', error);
      localStorage.removeItem('adminUser');
      router.push('/admin/login');
      return;
    }
  }, [router]);

  return <AdminDashboard />;
}

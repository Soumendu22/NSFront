/**
 * API Configuration Utility
 * Handles API URLs for both development and production environments
 */

// Get the backend URL from environment variables
const getBackendUrl = (): string => {
  // Use NEXT_PUBLIC_BACKEND_URL if available, otherwise fall back to NEXT_PUBLIC_API_URL
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!backendUrl) {
    console.warn('No backend URL configured. Falling back to localhost:5000');
    return 'http://localhost:5000';
  }

  // Remove trailing slash to prevent double slashes
  return backendUrl.replace(/\/$/, '');
};

// Get the API base URL (backend URL + /api)
const getApiUrl = (): string => {
  const backendUrl = getBackendUrl();
  return `${backendUrl}/api`;
};

/**
 * API URL builder functions
 */
export const API_URLS = {
  // Base URLs
  BACKEND: getBackendUrl(),
  API_BASE: getApiUrl(),
  
  // Authentication endpoints
  SIGNUP: `${getBackendUrl()}/signup`,
  LOGIN: `${getBackendUrl()}/login`,
  
  // Admin endpoints
  ADMIN_PROFILE: (userId: string) => `${getBackendUrl()}/admin/profile/${userId}`,
  ADMIN_SETUP: `${getBackendUrl()}/admin/setup`,
  
  // API endpoints
  ORGANIZATIONS: `${getApiUrl()}/organizations`,
  ENDPOINT_USERS: `${getApiUrl()}/endpoint-users`,
  PENDING_USERS: (organizationId: string) => `${getApiUrl()}/admin/pending-users?organizationId=${organizationId}`,
  APPROVE_USER: (userId: string) => `${getApiUrl()}/admin/approve-user/${userId}`,
  REJECT_USER: (userId: string) => `${getApiUrl()}/admin/reject-user/${userId}`,
  DOWNLOAD_DEMO_EXCEL: `${getApiUrl()}/admin/download-demo-excel`,
  BULK_UPLOAD: `${getApiUrl()}/admin/bulk-upload`,
  USER_IP: `${getApiUrl()}/user-ip`,
  ADMIN_IP: (adminId: string) => `${getApiUrl()}/admin/admin-ip?adminId=${adminId}`,

  // Wazuh SIEM/EDR integration endpoints
  WAZUH_CREDENTIALS: `${getApiUrl()}/admin/wazuh-credentials`,
  WAZUH_CREDENTIALS_CHECK: (userId: string) => `${getApiUrl()}/admin/wazuh-credentials/${userId}`,
  VERIFY_ADMIN_PASSWORD: `${getApiUrl()}/admin/verify-password`,
  WAZUH_PASSWORD_VIEW: `${getApiUrl()}/admin/wazuh-password`,

  // Analytics endpoints (organization-specific)
  ANALYTICS_USER_TRENDS: (timeRange: string, adminUserId: string) => `${getApiUrl()}/admin/analytics/user-trends?timeRange=${timeRange}&adminUserId=${adminUserId}`,
  ANALYTICS_ORGANIZATION_DISTRIBUTION: (adminUserId: string) => `${getApiUrl()}/admin/analytics/organization-distribution?adminUserId=${adminUserId}`,
  ANALYTICS_APPROVAL_STATUS: (adminUserId: string) => `${getApiUrl()}/admin/analytics/approval-status?adminUserId=${adminUserId}`,
  ANALYTICS_SYSTEM_STATUS: (adminUserId: string) => `${getApiUrl()}/admin/analytics/system-status?adminUserId=${adminUserId}`,
  ANALYTICS_RECENT_ACTIVITY: (limit: number, adminUserId: string) => `${getApiUrl()}/admin/analytics/recent-activity?limit=${limit}&adminUserId=${adminUserId}`,
  ANALYTICS_DEVICE_ANALYTICS: (adminUserId: string) => `${getApiUrl()}/admin/analytics/device-analytics?adminUserId=${adminUserId}`,
  ANALYTICS_HOURLY_ACTIVITY: (adminUserId: string) => `${getApiUrl()}/admin/analytics/hourly-activity?adminUserId=${adminUserId}`,
  ANALYTICS_SECURITY_METRICS: (adminUserId: string) => `${getApiUrl()}/admin/analytics/security-metrics?adminUserId=${adminUserId}`,
  ANALYTICS_GROWTH_METRICS: (timeRange: string, adminUserId: string) => `${getApiUrl()}/admin/analytics/growth-metrics?timeRange=${timeRange}&adminUserId=${adminUserId}`,
  
  // Utility function to build custom API URLs
  custom: (endpoint: string) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return endpoint.startsWith('/api/')
      ? `${getBackendUrl()}${endpoint}`
      : `${getApiUrl()}/${cleanEndpoint}`;
  }
};

/**
 * Fetch wrapper with automatic URL handling
 */
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = endpoint.startsWith('http') ? endpoint : API_URLS.custom(endpoint);

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
  }

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, finalOptions);

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status} ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
};

/**
 * Environment info for debugging
 */
export const getEnvironmentInfo = () => {
  const info = {
    backendUrl: getBackendUrl(),
    apiUrl: getApiUrl(),
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    envVars: {
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    }
  };

  // Log for debugging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('API Environment Info:', info);
  }

  return info;
};

// Export individual functions for convenience
export { getBackendUrl, getApiUrl };

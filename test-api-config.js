// Test script to verify API configuration
// Run with: node test-api-config.js

// Simulate environment variables
process.env.NEXT_PUBLIC_BACKEND_URL = 'https://test-backend.vercel.app';

// Mock the API utility (simplified version)
const getBackendUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  
  if (!backendUrl) {
    console.warn('No backend URL configured. Falling back to localhost:5000');
    return 'http://localhost:5000';
  }
  
  return backendUrl;
};

const getApiUrl = () => {
  const backendUrl = getBackendUrl();
  return `${backendUrl}/api`;
};

const API_URLS = {
  BACKEND: getBackendUrl(),
  API_BASE: getApiUrl(),
  SIGNUP: `${getBackendUrl()}/signup`,
  LOGIN: `${getBackendUrl()}/login`,
  ADMIN_PROFILE: (userId) => `${getBackendUrl()}/admin/profile/${userId}`,
  ADMIN_SETUP: `${getBackendUrl()}/admin/setup`,
  ORGANIZATIONS: `${getApiUrl()}/organizations`,
  ENDPOINT_USERS: `${getApiUrl()}/endpoint-users`,
};

console.log('🧪 Testing API Configuration...\n');

console.log('Environment Variables:');
console.log('NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('');

console.log('Generated URLs:');
console.log('Backend URL:', API_URLS.BACKEND);
console.log('API Base URL:', API_URLS.API_BASE);
console.log('Signup URL:', API_URLS.SIGNUP);
console.log('Login URL:', API_URLS.LOGIN);
console.log('Admin Profile URL:', API_URLS.ADMIN_PROFILE('test-user-id'));
console.log('Organizations URL:', API_URLS.ORGANIZATIONS);
console.log('Endpoint Users URL:', API_URLS.ENDPOINT_USERS);
console.log('');

// Test with localhost
console.log('🏠 Testing with localhost...');
process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:5000';
console.log('Backend URL:', getBackendUrl());
console.log('API Base URL:', getApiUrl());
console.log('');

// Test with production URL
console.log('🚀 Testing with production URL...');
process.env.NEXT_PUBLIC_BACKEND_URL = 'https://nexus-backend.vercel.app';
console.log('Backend URL:', getBackendUrl());
console.log('API Base URL:', getApiUrl());
console.log('');

console.log('✅ API configuration test completed!');
console.log('');
console.log('📝 Next steps:');
console.log('1. Deploy backend to Vercel');
console.log('2. Update NEXT_PUBLIC_BACKEND_URL with your backend URL');
console.log('3. Deploy frontend to Vercel');
console.log('4. Update backend FRONTEND_URL with your frontend URL');
console.log('5. Test the deployed application');

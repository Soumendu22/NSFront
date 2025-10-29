// Authentication utilities for NexusSentinel

export interface LogoutOptions {
  redirectTo?: string;
  showLoading?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Handles user logout with proper session cleanup
 */
export const handleLogout = async (options: LogoutOptions = {}) => {
  const {
    redirectTo = "/auth/login",
    showLoading = true,
    onSuccess,
    onError
  } = options;

  try {
    // Show loading state if requested
    if (showLoading) {
      // You can add a loading indicator here if needed
      console.log("Logging out...");
    }

    // Clear all user session data from localStorage
    const keysToRemove = [
      "userId",
      "userEmail", 
      "userName",
      "authToken",
      "sessionData"
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear any session storage as well
    sessionStorage.clear();

    // Optional: Call backend logout endpoint if you have one
    // try {
    //   await fetch('/api/auth/logout', { method: 'POST' });
    // } catch (backendError) {
    //   console.warn('Backend logout failed:', backendError);
    // }

    // Call success callback if provided
    if (onSuccess) {
      onSuccess();
    }

    // Small delay to show loading state
    if (showLoading) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }

  } catch (error) {
    console.error("Logout error:", error);
    
    // Call error callback if provided
    if (onError) {
      onError(error as Error);
    } else {
      // Fallback: still redirect even if there's an error
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
    }
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userId = localStorage.getItem("userId");
  return !!userId;
};

/**
 * Get current user ID from localStorage
 */
export const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem("userId");
};

/**
 * Redirect to login if not authenticated
 */
export const requireAuth = (redirectTo: string = "/auth/login") => {
  if (!isAuthenticated()) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
    return false;
  }
  return true;
};

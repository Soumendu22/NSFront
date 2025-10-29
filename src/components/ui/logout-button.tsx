"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { handleLogout } from '@/utils/auth';

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
  redirectTo?: string;
  onLogoutStart?: () => void;
  onLogoutComplete?: () => void;
  onLogoutError?: (error: Error) => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'outline',
  size = 'md',
  className = '',
  showIcon = true,
  showText = true,
  redirectTo = '/auth/login',
  onLogoutStart,
  onLogoutComplete,
  onLogoutError
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleClick = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    
    if (onLogoutStart) {
      onLogoutStart();
    }

    try {
      await handleLogout({
        redirectTo,
        showLoading: true,
        onSuccess: () => {
          if (onLogoutComplete) {
            onLogoutComplete();
          }
        },
        onError: (error) => {
          setIsLoggingOut(false);
          if (onLogoutError) {
            onLogoutError(error);
          }
        }
      });
    } catch (error) {
      setIsLoggingOut(false);
      if (onLogoutError) {
        onLogoutError(error as Error);
      }
    }
  };

  const buttonSizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const buttonVariants = {
    default: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
    outline: 'border-red-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-red-500 hover:text-purple-300',
    ghost: 'text-red-400 hover:bg-red-500/10 hover:text-red-300',
    destructive: 'bg-red-600 hover:bg-red-700 text-white'
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoggingOut}
      className={`
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
        transition-all duration-200
        ${isLoggingOut ? 'opacity-70 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {showText && 'Logging out...'}
        </>
      ) : (
        <>
          {showIcon && <LogOut className="w-4 h-4 mr-2" />}
          {showText && 'Logout'}
        </>
      )}
    </Button>
  );
};

// Preset configurations for common use cases
export const HeaderLogoutButton: React.FC<Partial<LogoutButtonProps>> = (props) => (
  <LogoutButton
    variant="outline"
    size="md"
    showIcon={true}
    showText={true}
    {...props}
  />
);

export const CompactLogoutButton: React.FC<Partial<LogoutButtonProps>> = (props) => (
  <LogoutButton
    variant="ghost"
    size="sm"
    showIcon={true}
    showText={false}
    className="w-10 h-10 p-0"
    {...props}
  />
);

export const DashboardLogoutButton: React.FC<Partial<LogoutButtonProps>> = (props) => (
  <LogoutButton
    variant="outline"
    size="md"
    showIcon={true}
    showText={true}
    className="text-purple-400 bg-black border-white hover:bg-gray-50/10 hover:border-gray-500"
    {...props}
  />
);

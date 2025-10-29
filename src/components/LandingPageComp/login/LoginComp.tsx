"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, LockIcon, ArrowRightIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { API_URLS, apiRequest } from "@/utils/api";

export default function LoginComp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  // setError("");

  try {
    const res = await apiRequest(API_URLS.LOGIN, {
      method: "POST",
      body: JSON.stringify({
        username: email, // or username field if you change label
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      // setError(data.message || "Login failed.");
      setIsLoading(false);
      return;
    }

    // Store user ID locally (for backward compatibility)
    if (data.id) {
      localStorage.setItem("userId", data.id);
    }

    // Fetch additional user data for the new admin dashboard
    try {
      const userResponse = await fetch(`http://localhost:5000/admin/profile/${data.id}`);
      if (userResponse.ok) {
        const profileData = await userResponse.json();

        // Get organization data
        const orgResponse = await fetch(`http://localhost:5000/api/organizations`);
        let organizationName = 'Unknown Organization';

        if (orgResponse.ok) {
          const organizations = await orgResponse.json();
          const userOrg = organizations.find((org: any) => org.id === data.id);
          if (userOrg) {
            organizationName = userOrg.company_name;
          }
        }

        // Store complete admin user data for new dashboard
        const adminUserData = {
          id: data.id,
          username: data.username,
          full_name: profileData.full_name || 'Admin User',
          email: profileData.email || email, // Use login email as fallback
          organization_id: data.id, // User ID is also organization ID
          organization_name: organizationName
        };

        localStorage.setItem("adminUser", JSON.stringify(adminUserData));
      }
    } catch (profileError) {
      console.error('Error fetching profile data:', profileError);
      // Store minimal admin data as fallback
      const fallbackAdminData = {
        id: data.id,
        username: data.username,
        full_name: 'Admin User',
        email: email,
        organization_id: data.id,
        organization_name: 'Unknown Organization'
      };
      localStorage.setItem("adminUser", JSON.stringify(fallbackAdminData));
    }

    router.push("/admin/dashboard"); // Redirect to admin dashboard

  } catch (err: any) {
    // setError("Network error, please try again.");
  } finally {
    setIsLoading(false);
  }
};



  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/signup");
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* Left side - Login form */}
      <motion.div 
        className="flex items-center justify-center w-full p-8 bg-black lg:w-1/2"
        initial={{ x: 0 }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <Card className="w-full max-w-md shadow-xl backdrop-blur-lg border-white/10 bg-black/80">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-white">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-300">
                  Username
                </Label>
                <div className="relative">
                  <UserIcon className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="username"
                    type="username"
                    placeholder="Enter your username"
                    className="pl-10 text-white bg-gray-900/50 border-white/10 focus:border-purple-500"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <LockIcon className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 text-white bg-gray-900/50 border-white/10 focus:border-purple-500"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-400 top-2 right-3 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 text-purple-600 bg-gray-900 border-gray-600 rounded focus:ring-purple-500"
                    checked={rememberMe}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember" className="text-sm text-gray-400">
                    Remember me
                  </label>
                </div>
                <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
                  Forgot credentials?
                </Link>
              </div>
              
              <Button
                type="submit"
                className="w-full text-white bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-800 hover:to-purple-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Sign in <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <button 
                onClick={handleSignupClick}
                className="font-medium text-purple-400 hover:text-purple-300"
              >
                Sign up
              </button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
      
      {/* Right side - Animated background */}
      <motion.div 
        className="relative hidden w-1/2 overflow-hidden bg-gradient-to-bl via-black to-purple-900 lg:block from-purple-950"
        initial={{ x: 0 }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/assets/images/NS_new.png"
            alt="NexusSentinel Logo"
            width={300}
            height={300}
            className="opacity-70 animate-pulse"
            style={{ animationDuration: '3s' }}
          />
        </div>
      </motion.div>
    </div>
  );
}

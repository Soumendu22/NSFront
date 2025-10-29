"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, Building2Icon, MailIcon, LockIcon, CheckIcon, ArrowRightIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PrivacyPolicyModal } from "@/components/ui/privacy-policy-modal";
import { TermsConditionsModal } from "@/components/ui/terms-conditions-modal";
import { API_URLS, apiRequest } from "@/utils/api";

export default function SignupComp() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacyPolicy, setAgreedToPrivacyPolicy] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Password validation
  const [validations, setValidations] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    noSpaces: true
  });

  const [flash, setFlash] = useState<{ type: "success" | "error", message: string } | null>(null);
  const showFlash = (type: "success" | "error", message: string) => {
  setFlash({ type, message });
  setTimeout(() => setFlash(null), 3500);
};



  const passwordRequirements = useMemo(() => [
    { key: 'minLength', label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { key: 'hasUppercase', label: 'Contains uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { key: 'hasLowercase', label: 'Contains lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { key: 'hasNumber', label: 'Contains number', test: (pwd: string) => /\d/.test(pwd) },
    { key: 'hasSpecialChar', label: 'Contains special character', test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
    { key: 'noSpaces', label: 'No spaces allowed', test: (pwd: string) => !/\s/.test(pwd) }
  ], []);

  // Split requirements into two columns
  const leftColumnRequirements = passwordRequirements.slice(0, 3);
  const rightColumnRequirements = passwordRequirements.slice(3);

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  // Password validation effect
  useEffect(() => {
    const newValidations: Record<string, boolean> = {};
    passwordRequirements.forEach(req => {
      newValidations[req.key] = req.test(password);
    });
    setValidations(newValidations as typeof validations);
  }, [password]);

  // Confirm password validation
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError("Passwords don't match");
    } else {
      setConfirmPasswordError("");
    }
  }, [password, confirmPassword]);

  // Form validation effect
  useEffect(() => {
    const allPasswordRequirementsMet = Object.values(validations).every(Boolean);
    const isValid =
      companyName.trim() !== "" &&
      email.trim() !== "" &&
      !emailError &&
      password.trim() !== "" &&
      confirmPassword.trim() !== "" &&
      !confirmPasswordError &&
      allPasswordRequirementsMet &&
      agreedToTerms &&
      agreedToPrivacyPolicy;

    setFormValid(isValid);
  }, [companyName, email, emailError, password, confirmPassword, confirmPasswordError, validations, agreedToTerms, agreedToPrivacyPolicy]);

  const validCount = Object.values(validations).filter(Boolean).length;
  // const allPasswordRequirementsMet = Object.values(validations).every(Boolean);

  // Modal handlers
  const handlePrivacyAgree = () => {
    setAgreedToPrivacyPolicy(true);
    setIsPrivacyModalOpen(false);
  };

  const handleTermsAgree = () => {
    setAgreedToTerms(true);
    setIsTermsModalOpen(false);
  };

  const getStrengthColor = () => {
    if (validCount <= 2) return 'bg-red-500';
    if (validCount <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (validCount <= 2) return 'Weak';
    if (validCount <= 4) return 'Medium';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formValid) return;

  setIsLoading(true);
  setEmailError("");
  setConfirmPasswordError("");
  setFlash(null);

  try {
    const res = await apiRequest(API_URLS.SIGNUP, {
      method: "POST",
      body: JSON.stringify({
        companyName,
        email,
        password,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setEmailError(data.message || "Signup failed.");
      showFlash("error", data.message || "Signup failed.");
      setIsLoading(false);
      return;
    }

    // Save user ID from response in localStorage
    if (data.id) {
      localStorage.setItem("userId", data.id);
    }

    showFlash("success", "Signup successful! Check your email for your username.");
    setTimeout(() => router.push("/login"), 1800);

  } catch (err: any) {
    showFlash("error", "Network error, please try again.");
  } finally {
    setIsLoading(false);
  }
};




  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/login");
  };

  return (
    <div className="flex w-full min-h-screen">
      {flash && (
        <motion.div
          initial={{ y: -70, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -70, opacity: 0 }}
          className={`
            fixed top-6 left-1/2 z-50 px-6 py-3 rounded-xl shadow-lg border
            ${flash.type === "success"
              ? "bg-green-700/90 text-white border-green-400"
              : "bg-red-700/90 text-white border-red-400"}
            -translate-x-1/2
          `}
          style={{ minWidth: 260, textAlign: "center" }}
        >
          {flash.message}
        </motion.div>
)}

      {/* Left side - Animated background */}
      <motion.div 
        className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br via-black to-purple-900 lg:block from-purple-950"
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
      
      {/* Right side - Signup form */}
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
              Create an account
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Enter your information to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-gray-300">
                  Company Name
                </Label>
                <div className="relative">
                  <Building2Icon className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="companyName"
                    placeholder="Your company name"
                    className="pl-10 text-white bg-gray-900/50 border-white/10 focus:border-purple-500"
                    value={companyName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <MailIcon className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`pl-10 text-white bg-gray-900/50 border-white/10 focus:border-purple-500 ${emailError ? 'border-red-500' : ''}`}
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setEmail(e.target.value);
                      if (e.target.value) validateEmail(e.target.value);
                    }}
                    onBlur={() => validateEmail(email)}
                    required
                  />
                </div>
                {emailError && (
                  <p className="mt-1 text-xs text-red-500">{emailError}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <LockIcon className="absolute w-4 h-4 text-gray-400 top-2 left-3" />
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

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-400">Password Strength</span>
                      <span className={`text-xs font-bold ${
                        validCount <= 2 ? 'text-red-500' : validCount <= 4 ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        {getStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${(validCount / passwordRequirements.length) * 100}%` }}
                      ></div>
                    </div>

                    {/* Requirements Checklist - Two Columns */}
                    <div className="grid grid-cols-2 mt-2 gap-y-1 gap-x-2">
                      {/* Left Column */}
                      <div className="space-y-1">
                        {leftColumnRequirements.map((req) => (
                          <div 
                            key={req.key}
                            className="flex items-center space-x-2"
                          >
                            <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                              validations[req.key as keyof typeof validations] 
                                ? 'text-green-500' 
                                : 'text-red-500'
                            }`}>
                              {validations[req.key as keyof typeof validations] ? 
                                <CheckIcon size={12} /> : 
                                <XIcon size={12} />
                              }
                            </div>
                            <span className={`text-xs ${
                              validations[req.key as keyof typeof validations] ? 'text-green-400' : 'text-gray-400'
                            }`}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Right Column */}
                      <div className="space-y-1">
                        {rightColumnRequirements.map((req) => (
                          <div 
                            key={req.key}
                            className="flex items-center space-x-2"
                          >
                            <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                              validations[req.key as keyof typeof validations] 
                                ? 'text-green-500' 
                                : 'text-red-500'
                            }`}>
                              {validations[req.key as keyof typeof validations] ? 
                                <CheckIcon size={12} /> : 
                                <XIcon size={12} />
                              }
                            </div>
                            <span className={`text-xs ${
                              validations[req.key as keyof typeof validations] ? 'text-green-400' : 'text-gray-400'
                            }`}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                  Confirm Password
                </Label>
                <div className="relative">
                  <LockIcon className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className={`pl-10 text-white bg-gray-900/50 border-white/10 focus:border-purple-500 ${confirmPasswordError ? 'border-red-500' : ''}`}
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute text-gray-400 top-2 right-3 hover:text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="mt-1 text-xs text-red-500">{confirmPasswordError}</p>
                )}
              </div>
              
              {/* Terms & Conditions Agreement */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="w-4 h-4 text-purple-600 bg-gray-900 border-gray-600 rounded focus:ring-purple-500"
                    checked={agreedToTerms}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreedToTerms(e.target.checked)}
                    required
                  />
                  <div>
                    <label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setIsTermsModalOpen(true)}
                        className="text-purple-400 underline transition-colors hover:text-purple-300"
                      >
                        Terms and Conditions
                      </button>
                    </label>
                    {agreedToTerms && (
                      <div className="mt-1 text-xs text-green-400 duration-500 animate-in fade-in-0">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Terms and Conditions Agreed
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Privacy Policy Agreement */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="privacy"
                    className="w-4 h-4 text-purple-600 bg-gray-900 border-gray-600 rounded focus:ring-purple-500"
                    checked={agreedToPrivacyPolicy}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreedToPrivacyPolicy(e.target.checked)}
                    required
                  />
                  <div>
                    <label htmlFor="privacy" className="text-sm text-gray-400 cursor-pointer">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setIsPrivacyModalOpen(true)}
                        className="text-purple-400 underline transition-colors hover:text-purple-300"
                      >
                        Privacy Policy
                      </button>
                    </label>
                    {agreedToPrivacyPolicy && (
                      <div className="mt-1 text-xs text-green-400 duration-500 animate-in fade-in-0">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Privacy Policy Agreed
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                type="submit"
                className={`w-full text-white bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-800 hover:to-purple-600 ${
                  !formValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading || !formValid}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Create account <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <button 
                onClick={handleLoginClick}
                className="font-medium text-purple-400 hover:text-purple-300"
              >
                Log in
              </button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Modals */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onAgree={handlePrivacyAgree}
      />

      <TermsConditionsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAgree={handleTermsAgree}
      />
    </div>
  );
}

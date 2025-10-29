"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import SignupComp from "./LandingPageComp/signup/SignupComp";
import LoginComp from "./LandingPageComp/login/LoginComp";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthWrapper() {
  const params = useParams<{ type: string }>();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(params.type === "login");

  useEffect(() => {
    setIsLogin(params.type === "login");
    
    // Validate the route parameter
    if (params.type !== "login" && params.type !== "signup") {
      router.replace("/");
    }
  }, [params.type, router]);

  return (
    <div className="overflow-hidden relative w-full min-h-screen">
      <AnimatePresence mode="wait">
        {isLogin ? (
          <motion.div
            key="login"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoginComp />
          </motion.div>
        ) : (
          <motion.div
            key="signup"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SignupComp />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
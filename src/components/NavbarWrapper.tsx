"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./LandingPageComp/Navbar";

// Paths where we don't want to show the navbar
const noNavbarPaths = ['/signup', '/login'];

export default function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Hide navbar on specific paths and any path starting with /auth/
  const showNavbar = !noNavbarPaths.includes(pathname) && !pathname.startsWith('/auth/');

  return (
    <>
      {showNavbar && <Navbar />}
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-purple-900">
        {children}
      </div>
    </>
  );
} 
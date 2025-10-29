"use client";

import { usePathname } from "next/navigation";
import NavbarWrapper from "./NavbarWrapper";

interface Props {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: Props) {
  const pathname = usePathname();

  // Don't show navbar on /admin (or any /admin sub-path) and /endpoint/signup
  const hideNavbar = pathname?.startsWith("/admin") || pathname === "/endpoint/signup" || pathname?.startsWith("/agent");

  if (hideNavbar) {
    return <>{children}</>; // render children only, no navbar
  }

  return <NavbarWrapper>{children}</NavbarWrapper>;
}

import type { Metadata } from "next";
import UserComp from "@/components/UserComp/UserComp";

export const metadata: Metadata = {
  title: "User Dashboard | Nexus Sentinel",
  description: "User dashboard for Nexus Sentinel platform",
};

export default function UserPage() {
  return <UserComp />;
} 
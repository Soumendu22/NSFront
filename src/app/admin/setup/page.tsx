import type { Metadata } from "next";
import AdminSetupForm from "@/components/AdminComp/AdminSetupForm";

export const metadata: Metadata = {
  title: "Admin Setup | Nexus Sentinel",
  description: "Complete your admin setup for Nexus Sentinel platform",
};

export default function AdminSetupPage() {
  return <AdminSetupForm />;
}

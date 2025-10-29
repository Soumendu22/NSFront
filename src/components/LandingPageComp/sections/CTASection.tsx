"use client";
import { Button } from "../../../components/ui/button";
import { ArrowRight, Users, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CTASection() {
  const router = useRouter();

  return (
    <section className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        {/* Main CTA */}
        <div className="overflow-hidden relative p-8 bg-gradient-to-r from-purple-700 to-white rounded-2xl md:p-12 mb-12">
          <div className="relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tighter text-black sm:text-4xl md:text-5xl">
                Ready to Secure Your Endpoints?
              </h2>
              <p className="mb-8 text-xl text-black/90">
                Join thousands of organizations that trust NexusSentinel for their security needs.
              </p>
              <div className="flex flex-col gap-4 justify-center sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => router.push('/admin/setup')}
                  className="text-purple-600 bg-white hover:bg-white/90 hover:text-black"
                >
                  <Shield className="mr-2 w-4 h-4" />
                  Start as Admin
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/endpoint/signup')}
                  className="text-black bg-transparent border-black hover:bg-white/10"
                >
                  <Users className="mr-2 w-4 h-4" />
                  Request Access
                </Button>
              </div>
            </div>
          </div>

          {/* Background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent" />
          </div>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full blur-3xl bg-white/20 animate-float" />
          <div className="absolute right-1/4 bottom-1/4 w-32 h-32 rounded-full blur-3xl bg-white/20 animate-float-delayed" />
        </div>

        {/* Endpoint User CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <div className="text-center">
              <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">For Organizations</h3>
              <p className="text-gray-300 mb-4">
                Set up your organization's security infrastructure and manage endpoint protection.
              </p>
              <Button
                onClick={() => router.push('/admin/setup')}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Setup Organization
              </Button>
            </div>
          </div>

          <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <div className="text-center">
              <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">For End Users</h3>
              <p className="text-gray-300 mb-4">
                Request access to join your organization's security network and protect your device.
              </p>
              <Button
                onClick={() => router.push('/endpoint/signup')}
                variant="outline"
                className="border-blue-400 text-blue-400 hover:bg-blue-400/10"
              >
                Request Access
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
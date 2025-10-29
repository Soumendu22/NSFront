"use client";

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, Eye, Lock, Database, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  onAgree
}) => {
  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAgree = () => {
    onAgree();
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-300"
      onClick={handleBackdropClick}
      style={{ zIndex: 9999 }}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-black/90 border border-white/20 rounded-2xl backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
              <p className="text-sm text-gray-400">Effective Date: January 1, 2024</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
          <div className="space-y-6 text-gray-300">
            
            {/* Introduction */}
            <section>
              <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-white">
                <Eye className="w-5 h-5 text-purple-400" />
                Introduction
              </h3>
              <p className="leading-relaxed">
                Welcome to NexusSentinel. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our cybersecurity platform and endpoint monitoring services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-white">
                <Database className="w-5 h-5 text-purple-400" />
                Information We Collect
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium text-white">Personal Information</h4>
                  <ul className="ml-4 space-y-1 list-disc">
                    <li>Name, email address, and contact information</li>
                    <li>Company information and organizational details</li>
                    <li>Account credentials and authentication data</li>
                    <li>Profile information and preferences</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-white">Technical Information</h4>
                  <ul className="ml-4 space-y-1 list-disc">
                    <li>Device information (OS, version, hardware specifications)</li>
                    <li>Network information (IP addresses, MAC addresses)</li>
                    <li>System logs and security event data</li>
                    <li>Usage patterns and application performance metrics</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-white">Security Data</h4>
                  <ul className="ml-4 space-y-1 list-disc">
                    <li>Threat detection and analysis information</li>
                    <li>Security incident reports and responses</li>
                    <li>Vulnerability assessments and scan results</li>
                    <li>Compliance and audit trail data</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-white">
                <Users className="w-5 h-5 text-purple-400" />
                How We Use Your Information
              </h3>
              <ul className="ml-4 space-y-2 list-disc">
                <li>Provide and maintain our cybersecurity services</li>
                <li>Monitor and protect your endpoints from security threats</li>
                <li>Generate security reports and analytics</li>
                <li>Improve our platform and develop new features</li>
                <li>Communicate with you about service updates and security alerts</li>
                <li>Comply with legal obligations and regulatory requirements</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </section>

            {/* Data Protection */}
            <section>
              <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-white">
                <Lock className="w-5 h-5 text-purple-400" />
                Data Protection & Security
              </h3>
              <p className="mb-3 leading-relaxed">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="ml-4 space-y-2 list-disc">
                <li>End-to-end encryption for data transmission</li>
                <li>Advanced encryption standards (AES-256) for data storage</li>
                <li>Multi-factor authentication and access controls</li>
                <li>Regular security audits and penetration testing</li>
                <li>SOC 2 Type II compliance and ISO 27001 certification</li>
                <li>Zero-trust architecture and network segmentation</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section>
              <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-white">
                <AlertTriangle className="w-5 h-5 text-purple-400" />
                Information Sharing & Disclosure
              </h3>
              <p className="mb-3 leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
              </p>
              <ul className="ml-4 space-y-2 list-disc">
                <li>With your explicit consent</li>
                <li>To trusted service providers who assist in our operations</li>
                <li>When required by law or legal process</li>
                <li>To protect our rights, property, or safety</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h3 className="mb-3 text-lg font-semibold text-white">Your Rights</h3>
              <p className="mb-3 leading-relaxed">
                You have the following rights regarding your personal information:
              </p>
              <ul className="ml-4 space-y-2 list-disc">
                <li>Access and review your personal data</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your information</li>
                <li>Data portability and export rights</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="mb-3 text-lg font-semibold text-white">Contact Us</h3>
              <p className="leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <div className="p-4 mt-3 border rounded-lg bg-white/5 border-white/10">
                <p className="text-white">Email: nexussentinelaiedr@gmail.com</p>
                <p className="text-white">Address: Mumbai, Maharashtra, India</p>
                <p className="text-white">Phone: +91 83690 31335</p>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAgree}
            className="px-6 text-white bg-purple-600 hover:bg-purple-700"
          >
            I Agree
          </Button>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  if (typeof document === 'undefined') return null;

  // Create or get portal container
  let portalContainer = document.getElementById('modal-portal');
  if (!portalContainer) {
    portalContainer = document.createElement('div');
    portalContainer.id = 'modal-portal';
    portalContainer.style.position = 'relative';
    portalContainer.style.zIndex = '9999';
    document.body.appendChild(portalContainer);
  }

  return createPortal(modalContent, portalContainer);
};

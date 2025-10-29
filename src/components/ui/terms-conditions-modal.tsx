"use client";

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Scale, Shield, AlertCircle, Gavel, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TermsConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export const TermsConditionsModal: React.FC<TermsConditionsModalProps> = ({
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
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Terms & Conditions</h2>
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
                <Scale className="w-5 h-5 text-purple-400" />
                Agreement to Terms
              </h3>
              <p className="leading-relaxed">
                These Terms and Conditions ("Terms") govern your use of the NexusSentinel cybersecurity platform and services. By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the service.
              </p>
            </section>

            {/* Service Description */}
            <section>
              <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-white">
                <Shield className="w-5 h-5 text-purple-400" />
                Service Description
              </h3>
              <p className="mb-3 leading-relaxed">
                NexusSentinel provides comprehensive cybersecurity services including:
              </p>
              <ul className="ml-4 space-y-2 list-disc">
                <li>Endpoint detection and response (EDR)</li>
                <li>Real-time threat monitoring and analysis</li>
                <li>Security incident response and management</li>
                <li>Vulnerability assessment and management</li>
                <li>Compliance monitoring and reporting</li>
                <li>Security analytics and intelligence</li>
              </ul>
            </section>

            {/* User Responsibilities */}
            <section>
              <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-white">
                <AlertCircle className="w-5 h-5 text-purple-400" />
                User Responsibilities
              </h3>
              <p className="mb-3 leading-relaxed">
                By using our services, you agree to:
              </p>
              <ul className="ml-4 space-y-2 list-disc">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not attempt to circumvent security measures</li>
                <li>Report security incidents promptly</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not interfere with the service or other users</li>
              </ul>
            </section>

            {/* Acceptable Use */}
            <section>
              <h3 className="mb-3 text-lg font-semibold text-white">Acceptable Use Policy</h3>
              <p className="mb-3 leading-relaxed">
                You may not use our service to:
              </p>
              <ul className="ml-4 space-y-2 list-disc">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit malicious code or conduct cyber attacks</li>
                <li>Access unauthorized systems or data</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Share access credentials with unauthorized parties</li>
                <li>Use the service for competitive intelligence</li>
              </ul>
            </section>

            {/* Data and Privacy */}
            <section>
              <h3 className="mb-3 text-lg font-semibold text-white">Data Handling</h3>
              <p className="mb-3 leading-relaxed">
                Our data handling practices include:
              </p>
              <ul className="ml-4 space-y-2 list-disc">
                <li>Data is processed in accordance with our Privacy Policy</li>
                <li>Customer data remains under customer control</li>
                <li>We implement industry-standard security measures</li>
                <li>Data retention policies are clearly defined</li>
                <li>Cross-border data transfers comply with applicable laws</li>
                <li>Data breach notification procedures are in place</li>
              </ul>
            </section>

            {/* Service Availability */}
            <section>
              <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-white">
                <Clock className="w-5 h-5 text-purple-400" />
                Service Availability
              </h3>
              <p className="leading-relaxed">
                We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. Scheduled maintenance will be announced in advance. We are not liable for service interruptions due to circumstances beyond our control, including but not limited to natural disasters, cyber attacks, or third-party service failures.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-white">
                <Gavel className="w-5 h-5 text-purple-400" />
                Limitation of Liability
              </h3>
              <p className="mb-3 leading-relaxed">
                To the maximum extent permitted by law:
              </p>
              <ul className="ml-4 space-y-2 list-disc">
                <li>Our liability is limited to the amount paid for services</li>
                <li>We are not liable for indirect or consequential damages</li>
                <li>We do not guarantee complete security or threat prevention</li>
                <li>Users are responsible for their own data backup and recovery</li>
                <li>We are not liable for third-party actions or services</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h3 className="mb-3 text-lg font-semibold text-white">Termination</h3>
              <p className="mb-3 leading-relaxed">
                Either party may terminate this agreement:
              </p>
              <ul className="ml-4 space-y-2 list-disc">
                <li>With 30 days written notice for convenience</li>
                <li>Immediately for material breach of terms</li>
                <li>Immediately for non-payment of fees</li>
                <li>Upon insolvency or bankruptcy</li>
              </ul>
              <p className="mt-3 leading-relaxed">
                Upon termination, access to services will cease, and data will be retained according to our data retention policy.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h3 className="mb-3 text-lg font-semibold text-white">Governing Law</h3>
              <p className="leading-relaxed">
                These Terms are governed by the laws of the jurisdiction where NexusSentinel is incorporated. Any disputes will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h3 className="mb-3 text-lg font-semibold text-white">Changes to Terms</h3>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms at any time. Material changes will be communicated with 30 days notice. Continued use of the service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="mb-3 text-lg font-semibold text-white">Contact Information</h3>
              <p className="leading-relaxed">
                For questions about these Terms, please contact us at:
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

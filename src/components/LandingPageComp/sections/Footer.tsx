import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how" },
  ],
  company: [
    { name: "About", href: "#about" },
    { name: "Blog", href: "#blog" },
    { name: "Careers", href: "#careers" },
    { name: "Contact", href: "#contact" },
  ],
  resources: [
    { name: "Documentation", href: "#docs" },
    { name: "API Reference", href: "#api" },
    { name: "Security", href: "#security" },
    { name: "Status", href: "#status" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#privacy" },
    { name: "Terms of Service", href: "#terms" },
    { name: "Cookie Policy", href: "#cookies" },
  ],
};

const socialLinks = [
  { name: "GitHub", icon: Github, href: "https://github.com" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
  { name: "Email", icon: Mail, href: "mailto:contact@nexussentinel.com" },
];

export default function Footer() {
  return (
    <footer className="relative border-t backdrop-blur-sm bg-background/50 border-white/10">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b via-transparent to-transparent from-purple-950/20" />
      
      <div className="container relative px-4 py-5 mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5">
          {/* Logo and Description */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-white">
                NexusSentinel
              </span>
            </Link>
            <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
              AI-Powered Endpoint Detection & Response for modern security needs.
            </p>
            <div className="flex space-x-5">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-300 text-muted-foreground hover:text-purple-500 hover:scale-110"
                >
                  <social.icon className="w-5 h-5" />
                  <span className="sr-only">{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          <div>
            <h3 className="mb-6 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-white">
              Product
            </h3>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="inline-block text-sm transition-all duration-300 text-muted-foreground hover:text-purple-500 hover:translate-x-1"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-white">
              Company
            </h3>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="inline-block text-sm transition-all duration-300 text-muted-foreground hover:text-purple-500 hover:translate-x-1"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-white">
              Resources
            </h3>
            <ul className="space-y-4">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="inline-block text-sm transition-all duration-300 text-muted-foreground hover:text-purple-500 hover:translate-x-1"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-white">
              Legal
            </h3>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="inline-block text-sm transition-all duration-300 text-muted-foreground hover:text-purple-500 hover:translate-x-1"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-4 border-t border-white/10">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="items-center text-sm text-center text-muted-foreground">
              © {new Date().getFullYear()} NexusSentinel. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a
                href="#privacy"
                className="inline-block text-sm transition-all duration-300 text-muted-foreground hover:text-purple-500 hover:translate-x-1"
              >
                Privacy
              </a>
              <a
                href="#terms"
                className="inline-block text-sm transition-all duration-300 text-muted-foreground hover:text-purple-500 hover:translate-x-1"
              >
                Terms
              </a>
              <a
                href="#cookies"
                className="inline-block text-sm transition-all duration-300 text-muted-foreground hover:text-purple-500 hover:translate-x-1"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 
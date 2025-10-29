import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

const navLinks = [
  { name: "Home", href: "#hero" },
  { name: "Features", href: "#features" },
  { name: "How it Works", href: "#how" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b shadow-lg backdrop-blur-lg bg-black/70 border-white/10">
      <div className="container flex items-center justify-between px-4 py-2 mx-auto">
        <Link href="/" className="flex items-center">
          <Image
            src="/assets/images/NS_new.png"
            alt="NexusSentinel Logo"
            width={64}
            height={64}
            priority
            className="object-contain w-16 h-12"
          />
        </Link>
        <div className="absolute transform -translate-x-1/2 left-1/2">
          <div className="flex items-center space-x-8">
            {navLinks.map(link => (
              <a
                key={link.name}
                href={link.href}
                className="relative px-2 py-1 text-sm font-semibold text-white transition-colors duration-200 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-950 hover:to-white"
                style={{
                  WebkitBackgroundClip: "text",
                }}
              >
                <span className="transition-colors duration-200 hover:bg-gradient-to-r hover:from-purple-950 hover:to-white hover:bg-clip-text hover:text-transparent">
                  {link.name}
                </span>
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="outline" className="border-white/20 hover:bg-white/10">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-gradient-to-r from-purple-700 to-white hover:from-purple-800 hover:to-white">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
} 
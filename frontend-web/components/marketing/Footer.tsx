"use client";

import Link from "next/link";
import { ShieldCheck, Twitter, Linkedin, Github } from "lucide-react";
import { Text } from "@/components/ui";

const footerLinks = {
  product: [
    { label: "Features", href: "/features" },
    { label: "How it works", href: "/how-it-works" },
    { label: "Use Cases", href: "/use-cases" },
    { label: "Pricing", href: "/contact" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Blog", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/privacy" },
    { label: "DPDP Compliance", href: "/privacy" },
  ],
  support: [
    { label: "Help Center", href: "/contact" },
    { label: "Documentation", href: "/how-it-works" },
    { label: "System Status", href: "/contact" },
  ],
};

const socialLinks = [
  { name: "Twitter", href: "#", icon: <Twitter className="w-4 h-4" /> },
  { name: "LinkedIn", href: "#", icon: <Linkedin className="w-4 h-4" /> },
  { name: "GitHub", href: "#", icon: <Github className="w-4 h-4" /> },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-card" />
              </div>
              <div>
                <span className="text-base font-bold">VMS</span>
                <span className="block text-xs text-primary font-medium">Visitor Management</span>
              </div>
            </Link>
            <Text variant="body" className="text-card/70 mb-4 max-w-xs">
              Secure, contactless visitor management for Indian gated societies, offices, and factories. DPDP Act 2023 compliant.
            </Text>
            
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-8 h-8 rounded-lg bg-card/10 flex items-center justify-center text-card/60 hover:text-card hover:bg-primary transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <Text variant="eyebrow" as="span" className="text-card block mb-3">Product</Text>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-card/70 hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Text variant="eyebrow" as="span" className="text-card block mb-3">Company</Text>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-card/70 hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Text variant="eyebrow" as="span" className="text-card block mb-3">Legal</Text>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-card/70 hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Text variant="eyebrow" as="span" className="text-card block mb-3">Support</Text>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-card/70 hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-card/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Text variant="caption" className="text-card/50">
              © {currentYear} VMS. All rights reserved.
            </Text>
            <div className="flex items-center gap-4 text-xs text-card/50">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                DPDP Compliant
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Secure by Design
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-primary">🇮🇳</span>
                Made in India
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

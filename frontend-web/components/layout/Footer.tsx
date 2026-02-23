"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <span className="text-xl font-bold text-foreground">VMS</span>
            </div>
            <p className="text-muted text-sm max-w-sm">
              Secure, contactless visitor management for Indian gated societies, offices, and factories. DPDP compliant.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/features" className="text-sm text-muted hover:text-primary">Features</Link></li>
              <li><Link href="/use-cases" className="text-sm text-muted hover:text-primary">Use Cases</Link></li>
              <li><Link href="/how-it-works" className="text-sm text-muted hover:text-primary">How it works</Link></li>
              <li><Link href="/faq" className="text-sm text-muted hover:text-primary">FAQ</Link></li>
              <li><Link href="/about" className="text-sm text-muted hover:text-primary">About</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-muted hover:text-primary">Privacy & DPDP</Link></li>
              <li><Link href="/contact" className="text-sm text-muted hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Quick links</h3>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-sm text-muted hover:text-primary">Login</Link></li>
              <li><Link href="/checkin" className="text-sm text-muted hover:text-primary">Check-in</Link></li>
              <li><Link href="/visitors" className="text-sm text-muted hover:text-primary">Visitors</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted">
          © {new Date().getFullYear()} Visitor Management System. Built for India.
        </div>
      </div>
    </footer>
  );
}

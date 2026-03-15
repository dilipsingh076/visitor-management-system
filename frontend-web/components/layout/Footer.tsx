"use client";

import { ShieldCheck } from "lucide-react";
import { Container, StyledLink } from "@/components/ui";
import { theme } from "@/lib/theme";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={theme.footer.root}>
      <Container>
        <div className={theme.footer.section}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </span>
                <span className="text-xl font-bold text-card">VMS</span>
              </div>
              <p className="text-muted-foreground/90 text-sm max-w-sm leading-relaxed">
                Secure, contactless visitor management for Indian gated societies, offices, and factories. DPDP compliant.
              </p>
            </div>
            <div>
              <h3 className={`${theme.footer.heading} text-card`}>Product</h3>
              <ul className="space-y-3">
                <li><StyledLink href="/features" variant="footer">Features</StyledLink></li>
                <li><StyledLink href="/use-cases" variant="footer">Use Cases</StyledLink></li>
                <li><StyledLink href="/how-it-works" variant="footer">How it works</StyledLink></li>
                <li><StyledLink href="/faq" variant="footer">FAQ</StyledLink></li>
                <li><StyledLink href="/about" variant="footer">About</StyledLink></li>
              </ul>
            </div>
            <div>
              <h3 className={`${theme.footer.heading} text-card`}>Legal</h3>
              <ul className="space-y-3">
                <li><StyledLink href="/privacy" variant="footer">Privacy & DPDP</StyledLink></li>
                <li><StyledLink href="/contact" variant="footer">Contact</StyledLink></li>
              </ul>
            </div>
            <div>
              <h3 className={`${theme.footer.heading} text-card`}>Quick links</h3>
              <ul className="space-y-3">
                <li><StyledLink href="/login" variant="footer">Login</StyledLink></li>
                <li><StyledLink href="/checkin" variant="footer">Check-in</StyledLink></li>
                <li><StyledLink href="/visitors" variant="footer">Visitors</StyledLink></li>
              </ul>
            </div>
          </div>
          <div className={theme.footer.bottom}>
            © {year} Visitor Management System. Built for India.
          </div>
        </div>
      </Container>
    </footer>
  );
}

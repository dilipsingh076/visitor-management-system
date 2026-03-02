"use client";

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
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
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

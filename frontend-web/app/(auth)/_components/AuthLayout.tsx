import Link from "next/link";
import { WelcomeIllustration } from "@/components/ui";
import { theme } from "@/lib/theme";

type MaxWidth = "md" | "lg" | "xl" | "2xl";

type AuthLink = { href: string; label: string };

type Props = {
  title: string;
  subtitle: string;
  maxWidth?: MaxWidth;
  links?: AuthLink[];
  children: React.ReactNode;
};

export function AuthLayout({
  title,
  subtitle,
  maxWidth = "md",
  links = [],
  children,
}: Props) {
  return (
    <div className={`${theme.layout.flexRow} ${theme.auth.screen}`}>
      {/* Left: branding */}
      <div className={`${theme.auth.panel} bg-gradient-to-br from-primary via-primary to-primary-hover`}>
        <div className="max-w-sm">
          <div className={theme.auth.panelIcon}>
            <WelcomeIllustration className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Visitor Management for Societies
          </h2>
          <p className="text-sm text-white/90 mt-3 leading-relaxed">
            Contactless check-in, pre-approvals, and DPDP-compliant tracking for housing societies and apartments.
          </p>
          <ul className={theme.auth.panelList}>
            <li className="flex items-center gap-3">
              <span className={theme.auth.panelBadge}>1</span>
              <span className="text-white/95">QR & OTP check-in</span>
            </li>
            <li className="flex items-center gap-3">
              <span className={theme.auth.panelBadge}>2</span>
              <span className="text-white/95">Resident approvals & muster</span>
            </li>
            <li className="flex items-center gap-3">
              <span className={theme.auth.panelBadge}>3</span>
              <span className="text-white/95">India & DPDP ready</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right: form area */}
      <div className={`${theme.layout.flex1} ${theme.layout.scrollArea} ${theme.layout.containerPadding} ${theme.surface.page}`}>
        <div className={`w-full flex-shrink-0 ${theme.layout.maxWidth[maxWidth]}`}>
          <div className={theme.auth.formCard}>
            <div className={theme.auth.formCardHeader}>
              <div className={theme.auth.panelIconMobile}>
                <WelcomeIllustration className="w-7 h-7 text-white" />
              </div>
              <h1 className={theme.text.heading1}>{title}</h1>
              <p className={theme.text.subtitle}>{subtitle}</p>
            </div>
            <div className={`${theme.layout.contentPadding} ${theme.auth.formCardBody}`}>{children}</div>
            <div className={theme.auth.formCardFooter}>
              {links.map((l) => (
                <Link key={l.href} href={l.href} className={theme.auth.link}>
                  {l.label}
                </Link>
              ))}
              <Link href="/" className={theme.auth.linkMuted}>
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

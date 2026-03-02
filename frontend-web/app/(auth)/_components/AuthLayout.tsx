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
      {/* Left: branding — softer gradient and clearer hierarchy */}
      <div className={`${theme.auth.panel} bg-gradient-to-br from-primary via-primary to-primary-hover`}>
        <div className="max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 shadow-lg">
            <WelcomeIllustration className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Visitor Management for Societies
          </h2>
          <p className="text-sm text-white/90 mt-3 leading-relaxed">
            Contactless check-in, pre-approvals, and DPDP-compliant tracking for housing societies and apartments.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-white/95">
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/25 flex items-center justify-center text-sm font-semibold shrink-0">1</span>
              <span>QR & OTP check-in</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/25 flex items-center justify-center text-sm font-semibold shrink-0">2</span>
              <span>Resident approvals & muster</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/25 flex items-center justify-center text-sm font-semibold shrink-0">3</span>
              <span>India & DPDP ready</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right: form area */}
      <div className={`${theme.layout.flex1} ${theme.layout.scrollArea} ${theme.layout.containerPadding} ${theme.surface.page}`}>
        <div className={`w-full flex-shrink-0 ${theme.layout.maxWidth[maxWidth]}`}>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/90 overflow-hidden">
            <div className="px-6 sm:px-8 lg:px-10 pt-8 pb-5 border-b border-slate-100">
              <div className="md:hidden w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
                <WelcomeIllustration className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">{title}</h1>
              <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
            </div>
            <div className="px-6 sm:px-8 lg:px-10 py-6 sm:py-8">{children}</div>
            <div className="px-6 sm:px-8 lg:px-10 py-5 pt-4 border-t border-slate-100 flex flex-col items-center gap-2 text-center">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="text-sm font-medium text-slate-500 hover:text-primary transition">
                  {l.label}
                </Link>
              ))}
              <Link href="/" className="text-sm text-slate-400 hover:text-primary transition">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
